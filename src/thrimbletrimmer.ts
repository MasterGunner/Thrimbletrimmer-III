// https://github.com/Microsoft/TypeScript-Node-Starter/blob/master/src/app.ts

import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";

// Load environment variables from .env file, where API keys and passwords are configured
dotenv.config({ path: ".env.development" });

// Create Express server
const app = express();

// Controllers (route handlers)
import * as homeController from "./controllers/home";
import * as videoController from "./controllers/video";

// Express configuration
app.set("port", process.env.PORT || 3000);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static(__dirname + '/public'));
//app.use(express.static('Constants.VIDEOSLOCATION'))

/**
 * Primary app routes.
 */
app.get("/", homeController.index);
app.get('/getVideo/:a?', videoController.getVideo);
app.post('/setVideo', videoController.submitVideo);

export default app;