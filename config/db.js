const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI');
console.log(db);
const connectDB = async () =>{
    try {
        await mongoose.connect(db, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true });
        console.log('connected');
    } catch(err){
        process.exit(1);
    }
}

module.exports =  connectDB;