const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const Tour = require('../../models/tourModel');

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

const tours = JSON.parse(
    fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')
);

const importData = async() => {
    try {
        await Tour.create(tours);
        console.log('Data Successfully loaded');
        process.exit();
    } catch (err) {
        console.log(err);
    }
};

const deletedata = async() => {
    try {
        await Tour.deleteMany();
        console.log('Data Successfully deleted');
        process.exit();
    } catch (err) {
        console.log(err);
    }
};
if (process.argv[2] === '--import') {
    importData();
} else if (process.argv[2] === '--delete') {
    deletedata();
}
console.log(process.argv);