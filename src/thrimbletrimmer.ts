// https://github.com/Microsoft/TypeScript-Node-Starter/blob/master/src/app.ts

import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";

// Load environment variables from .env file, where API keys and passwords are configured
dotenv.config({ path: ".env.development" });

// Create Express server
const app = express();

// Express configuration
app.set("port", process.env.PORT || 3000);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static(__dirname + '/public'));
//app.use(express.static('Constants.VIDEOSLOCATION'))

app.get('/', function (req, res) {
    var indexPage = '';
    // WubloaderIntegration.getVideos().forEach(function(video) {
    //     indexPage += '<li><a href="/Thrimbletrimmer.html?Video='+video[0].vidID+'">'+video[0].vidID+'</a></li>'
    // });
    indexPage = '<body><h1>Welcome to Thrimbletrimmer!</h1><ul>' + indexPage + '</ul></body>'
    res.type('html');
    res.send(indexPage);
});

export default app;