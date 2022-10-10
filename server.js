const mongoose = require('mongoose');
const dotenv = require('dotenv');
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
app.listen(port, () => {
    console.log('app is listening on port 3000');
});