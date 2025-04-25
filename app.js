const express =require('express');
const app= new express();
const router =require('./src/route/api');
const rateLimit =require('express-rate-limit');
const helmet =require('helmet');
const hpp =require('hpp');
const cors =require('cors');
const cookieParser = require('cookie-parser');
const path = require("path");
const mongoose=require('mongoose');
require('dotenv').config();

app.use(cookieParser());
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true // যদি cookie বা credentials allow করতে চাও
}));app.use(helmet())
app.use(hpp())

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));


const limiter= rateLimit({windowMs:15*60*1000,max:30000})
app.use(limiter)




// Database Connection



const URI = "mongodb+srv://shakrabby29:QDqEP2OOxLEcuOSO@cluster0.4sujk.mongodb.net/MessManagement?retryWrites=true&w=majority&appName=Cluster0";


const OPTION = {
    autoIndex: true,
};

mongoose.connect(URI, OPTION)
    .then(() => {
        console.log("DB Success: Connected to MongoDB Atlas");
    })
    .catch((err) => {
        console.log("DB Connection Error:", err);
    });





app.set('etag', false);

app.use("/api",router)
app.use(express.static(path.join(__dirname, 'client', 'dist')));



// Add React Front End Routing
app.get('*',function (req,res) {
    res.sendFile(path.resolve(__dirname,'client','dist','index.html'))
})


module.exports=app;