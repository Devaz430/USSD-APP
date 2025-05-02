

    const express = require('express')
    , ussdconnect = express()
    , bodyParser = require('body-parser')
    ,  bunyan = require("bunyan")
    , colors = require('colors')
    , axios = require('axios')
    , JSONCache =require("redis-json")
    , Redis = require("ioredis")
    , redis = new Redis()
    , jsonCache = new JSONCache(redis),
    morgan = require('morgan'),
    xmlparser = require('express-xml-bodyparser')
    , log =  bunyan.createLogger({
                                        name: 'OneUSSD',
                                        streams: [{
                                            level: 'info',  
                                            serializers: bunyan.stdSerializers,
                                            type: 'rotating-file',
                                            path: '/syss/logs/oneussd-info.log',
                                            period: '1d',   // daily rotation
                                            count: 3        // keep 3 back copies
                                        },{
                                            level: 'error',  
                                            type: 'rotating-file',
                                            path: '/syss/logs/oneussd-error.log',
                                            period: '1d',   // daily rotation
                                            count: 3        // keep 3 back copies
                                        },{
                                            level: 'debug',  
                                            type: 'rotating-file',
                                            path: '/syss/logs/oneussd-debug.log',
                                            period: '1d',   // daily rotation
                                            count: 3        // keep 3 back copies
                                        }]
                                        })
  
 

         ussdconnect.use(express.json());
         ussdconnect.use(express.urlencoded({ extended: true }));
         ussdconnect.use(morgan('tiny'));
   



     
      module.exports.init = function (configs) {
        const app = express();
    
         ussdconnect.use(express.json());
         ussdconnect.use(express.urlencoded({ extended: true }));

   
         app.use(bodyParser.json());
         app.use(bodyParser.urlencoded({ extended: true }));

     


       
    
        // app.use(function (err, req, res, next) {
        //     res.status(500).send(err);
        // })
        app.post('/webhook/ussd', (req, res) => {
          const { body: { text: rawText } } = req;
        });
var response ={app:app,http: axios,jsonCache:jsonCache,log:log}
        return response;
    };
