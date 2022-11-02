const { format } = require('date-fns'); 
const fs = require('fs'); 
const fsPromises = require('fs').promises;
const path = require('path'); 
const { v4:uuid } = require('uuid');


const logEvents = async(message, logFileName) => {
    const dateTime = `${format(new Date(), 'yyyMMdd\tHH:mm:ss')}`;
    const logItem = `${dateTime}\t${uuid()}\t${message}\n`; // pass the log message

    try{
        // the directory does not exist 
        if(!fs.existsSync(path.join(__dirname, '..', 'logs'))){
            await fsPromises.mkdir(path.join(__dirname, '..', 'logs')); // create the directory called logs
        }
        // provide 
        await fsPromises.appendFile(path.join(__dirname, '..', 'logs', logFileName), logItem);
    } catch(err){
        console.log(err); 
    }
};

const logger = (req, res, next) =>{
    // logEvents(`${req.method}\t${req.url}\t${req.headers.origin}`, 'reqLog.log'); 
    console.log(`${req.method}${req.path}`);
    next();

}

module.exports = {logEvents, logger}; 