import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import bodyParser from 'body-parser';
import Routes from './Routes/routes.js';
import cors from 'cors';
import { getDashboardDB } from './config/ConnectMongoDB.js';

const PORT = process.env.PORT || 3003;
const uri = process.env.MONGO_URL;

const app = express();
const MONGO_DB_URI = process.env.MONGO_DB_URI;

getDashboardDB(MONGO_DB_URI);

app.use(cors());
app.use(bodyParser.json());

app.use(express.json()); // this is required to parse JSON bodies
app.use(express.urlencoded({ extended: true }));  // parses form-data

app.use('/uploads', express.static('uploads'));

app.use("/api", Routes);

app.get("/", (req, res) => {
    res.status(200).json({
        status: "200",
        message: "API is running"
    });
})

app.listen(PORT, () => {
    console.log(`Server is listening on http://localhost:${PORT}`);
});