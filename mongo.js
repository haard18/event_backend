const mongoose=require('mongoose');
require('dotenv').config();

const databaseUrl = process.env.DATABASE_URL;
const connectTOMongoDB=async()=>{
    try{
        await mongoose.connect(databaseUrl,{useNewUrlParser:true,useUnifiedTopology:true});
        console.log('Connected to MongoDB');
    }catch(error){
        console.log('Error:',error.message);
    }
};
module.exports=connectTOMongoDB;