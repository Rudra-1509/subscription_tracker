import mongoose from "mongoose";
import { NODE_ENV, DB_URI } from "../config/env.js";

if(!DB_URI){
    console.log(DB_URI);
    throw new Error('Please define the MONGODB_URI environment variable inside .env.<development/production>.local');
}

const connenctToDatabase= async ()=>{
    try {
        await mongoose.connect(DB_URI);
        console.log(`Connected to database in ${NODE_ENV} mode`);
    } catch (error) {
        console.log('Error connecting to Database.',error);
        process.exit(1);
    }
};

export default connenctToDatabase;