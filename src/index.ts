import express from "express";
import mongoose from "mongoose"
import dotenv from "dotenv";

dotenv.config();

import appointmentRoute from './routes/appointmentRoute'
import authRoute from './routes/authRoute'

export const app = express();
app.use(express.json());
const PORT = 3000;


const connectDB = async() => {
    try {
        await mongoose.connect(String(process.env.DB_URL))
        console.log("Database Connected");  
    } catch (error) {
        console.error("mongo connection error", error);
        process
    }
}

app.get("/", (req, res) => {
    res.send("Hello, World!");
})

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Serve is listening on http://localhost:${PORT}`);
        }
    )
});

app.use('/api/auth', authRoute);
app.use('/api/appointments', appointmentRoute);