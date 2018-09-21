"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const errorhandler_1 = __importDefault(require("errorhandler"));
const thrimbletrimmer_1 = __importDefault(require("./thrimbletrimmer"));
/**
 * Error Handler. Provides full stack - remove for production
 */
thrimbletrimmer_1.default.use(errorhandler_1.default());
/**
 * Start Express server.
 */
const server = thrimbletrimmer_1.default.listen(thrimbletrimmer_1.default.get("port"), () => {
    console.log("  App is running at http://localhost:%d in %s mode", thrimbletrimmer_1.default.get("port"), thrimbletrimmer_1.default.get("env"));
    console.log("  Press CTRL-C to stop\n");
});
exports.default = server;
//# sourceMappingURL=server.js.map