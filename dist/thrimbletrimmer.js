"use strict";
// https://github.com/Microsoft/TypeScript-Node-Starter/blob/master/src/app.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables from .env file, where API keys and passwords are configured
dotenv_1.default.config({ path: ".env.development" });
// Create Express server
const app = express_1.default();
// Controllers (route handlers)
const homeController = __importStar(require("./controllers/home"));
const videoController = __importStar(require("./controllers/video"));
// Express configuration
app.set("port", process.env.PORT || 3000);
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use(express_1.default.static(__dirname + '/public'));
//app.use(express.static('Constants.VIDEOSLOCATION'))
/**
 * Primary app routes.
 */
app.get("/", homeController.index);
app.get('/getVideo/:a?', videoController.getVideo);
app.post('/setVideo', videoController.submitVideo);
exports.default = app;
//# sourceMappingURL=thrimbletrimmer.js.map