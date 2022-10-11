const mongoose = require('mongoose');
const dotenv = require('dotenv');

//Uncaught exception: This should be at the top of our page
process.on('uncaughtException', (err) => {
    //shut down the applicatioon
    console.log('Uncaught Expception, shutting down......');
    // console.log(err.name, err.message);
    console.log(err.name + ', ' + err.message);
    process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

//Process.env creates an object that contains environment variables
const db = process.env.DATABASE.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD
);

//These are just default settings
mongoose
    .connect(db, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log('Database connection successful');
    });
// const testUser = new User({
//     name: 'Oshioke Salaki',
//     email: 'Salaki1902@gmail.com',
//     role: 'admin',
//     active: true,
//     photo: 'user-4.jpg',
// });

// testUser
//     .save()
//     .then((document) => {
//         console.log(document);
//     })
//     .catch((err) => {
//         console.log(err);
//     });

// const testTour = new Tour({

// });

// testTour
//     .save()
//     .then((document) => {
//         console.log(document);
//     })
//     .catch((err) => {
//         console.log(err);
//     });

//start server
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log('app is listening on port 3000');
});

//Global Unhandled rejections controller
process.on('unhandledRejection', (err) => {
    //shut down the applicatioon
    console.log('Unhandled rejection, shutting down......');
    console.log(err.name, err.message);
    // console.log(err);
    //This gives the server a chance to close up any pending operations
    server.close(() => {
        process.exit(1);
    });
});