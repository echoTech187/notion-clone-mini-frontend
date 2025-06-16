const mongoose = require('mongoose');

const DB = process.env.MONGO_URI;

const connectToMoongose = async () => {
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/mini-notion-db", {});
        console.log('Database connected');
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

module.exports = connectToMoongose;