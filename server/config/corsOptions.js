const allowedOrigins = require('./allowedOrigins'); 

const corsOptions = {
    origin: (origin, callback) => {
        if (allowedOrigins.indexOf(origin) !== -1 || !origin){
            callback(null, true); 
        } else{
            callback(new Error('Not allowed by CORS'))
        }
    }, 
    credentials: true,  // Configures the Access-Control-Max-Age CORS header.
    optionsSuccessStatus: 200 // some legacy browsers cannot handle the default status code (i.e. 204)
}

module.exports = corsOptions; 