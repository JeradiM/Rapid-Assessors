const express = require("express"); 
const mongoose = require("mongoose"); 
require("dotenv").config();
const bodyParser = require("body-parser");
const cors = require("cors");
const userRoute = require("./routes/userRoute");
const errorHandler = require("./middleWare/errorMiddleware"); 
const cookieParser = require("cookie-parser");
const path = require("path");
const { logger } = require("./middleWare/logger");
const corsOptions = require("./config/corsOptions");

const app = express(); 
const PORT = process.env.PORT || 5000; // port to run the server on

// Middlewares 
app.use(logger);
app.use(express.json()); // helps us handle json data 
app.use(cookieParser()); // parsing cookies 
app.use(express.urlencoded({extended: false}));  // helps us handle data that comes in from the URL 
app.use(bodyParser.json()); // used to parse the data received from the front end to the backend
app.use(cors(corsOptions));

app.use('/', express.static(path.join(__dirname, '/public')));
app.use('/', require('./routes/root'));
 

// Routes Middleware
app.use("/api/users", userRoute); // first arg is a prefix to the API Endpoint(aka the userRoute)

// Routes 
app.get("/", (req, res)=>{
    res.send('You are on the homepage');
});

// Error Middleware
app.use(errorHandler); 

app.all('*', (req, res) => {
    res.status(404)
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'))
    } else if (req.accepts('json')) {
        res.json({ message: '404 Not Found' })
    } else {
        res.type('txt').send('404 Not Found')
    }
})

// connect to mongodb and start listening on the server 
mongoose
    .connect(process.env.MONGODB_URI, {connectTimeoutMS: 3000})
    .then(()=>{
        app.listen(PORT, () =>{console.log(`Server running on Port ${PORT}`);})
            })
    .catch((err) => {console.log(err);
    });