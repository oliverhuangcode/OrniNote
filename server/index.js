import express from 'express';
import connectToDB from './config/db.js';
import dotenv from 'dotenv';

import { User } from './models/users.js';

dotenv.config();

const PORT = process.env.PORT_MONGO;

const app = express();
app.use(express.json()) // might not need

connectToDB() 

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});


const user1 = new User({
    username: "testingglobalorninoteaccount",
    password: "orninote",
    email: "orninote@gmail.com"
});

const savedUser = await user1.save();
console.log('User created:', savedUser);
