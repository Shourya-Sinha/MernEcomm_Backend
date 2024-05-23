const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const fileUpload = require('express-fileupload');
const cloudinary = require('cloudinary').v2;
const router = require('./Routes/productRoute');
const userRouter = require('./Routes/userRoutes');
const orderRouter = require('./Routes/orderRoute');

const PORT = 3000;
const DB = 'mongodb://localhost:27017/Product_Feature';
const CLOUDINARY_NAME = 'dswrtx6ja';
const CLOUDINARY_API_KEY = '668749297969338';
const CLOUDINARY_API_SECRET = 'TCnrXgyQSSzGPmtBE-5LvR3DJ7w';

const app = express();

mongoose.connect(DB).then(() => {
    console.log('DATABASE CONNECTED SUCCESSFULLY');
}).catch(() => {
    console.log('Problem connecting to the database');
});

cloudinary.config({
    cloud_name: CLOUDINARY_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET
});

if (cloudinary.config().cloud_name) {
    console.log('Cloudinary connected successfully');
} else {
    console.error('Error connecting to Cloudinary');
}

// Middleware for file upload
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/'
}));

// Middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

// Log the request body and files for debugging
// app.use((req, res, next) => {
//     console.log('Body:', req.body);
//     console.log('Files:', req.files);
//     next();
// });

// Routes
app.use(router);
app.use(userRouter);
app.use(orderRouter);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
