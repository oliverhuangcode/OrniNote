import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const connectionString = process.env.MONGODB_URI;const connectToDB = async () => {
    try {
        await mongoose.connect(connectionString, {
            autoIndex: true
        })
        console.log('Connected to Mongodb Atlas');} catch (error) {
        console.error(error);
    }
}

export default connectToDB