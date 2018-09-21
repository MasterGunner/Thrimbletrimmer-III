"use strict";
// https://github.com/Microsoft/TypeScript-Node-Starter/blob/master/src/app.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables from .env file, where API keys and passwords are configured
dotenv_1.default.config({ path: ".env.development" });
// Create Express server
const app = express_1.default();
// Express configuration
app.set("port", process.env.PORT || 3000);
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use(express_1.default.static(__dirname + '/public'));
//app.use(express.static('Constants.VIDEOSLOCATION'))
app.get('/', function (req, res) {
    var indexPage = '';
    // WubloaderIntegration.getVideos().forEach(function(video) {
    //     indexPage += '<li><a href="/Thrimbletrimmer.html?Video='+video[0].vidID+'">'+video[0].vidID+'</a></li>'
    // });
    indexPage = '<body><h1>Welcome to Thrimbletrimmer!</h1><ul>' + indexPage + '</ul></body>';
    res.type('html');
    res.send(indexPage);
});
exports.default = app;
//# sourceMappingURL=thrimbletrimmer.js.map