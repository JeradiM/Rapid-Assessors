const { logEvents } = require('./logger'); 
// first three args are self explanatory err: error message, req: request body, res: response body 
// fourth arg: next, is the next piece of middleware firing
const errorHandler = (err, req, res, next) => {
    
    // save any errors met by the error handler to a log file 
    logEvents(`${err.name}\t${err.message}\t${req.headers.origin}\t${req.method}\t${req.url}`, 'errLog.log'); 
    console.log(`${err.stack}`);
    // send the response of the error to the client
    const statusCode = res.statusCode ? res.statusCode : 500;
    res.status(statusCode); 
    res.json({
        message: err.message, 
        stack: process.env.NODE_ENV === "development" ? err.stack : null,
    }); 
};

module.exports = errorHandler;