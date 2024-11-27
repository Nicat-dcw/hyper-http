"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = void 0;
var node_http_1 = require("node:http");
var router_ts_1 = require("./router.ts");
var App = /** @class */ (function () {
    function App() {
        this.router = new router_ts_1.Router();
    }
    App.prototype.get = function (path, handler) {
        this.router.get(path, handler);
        return this;
    };
    App.prototype.post = function (path, handler) {
        this.router.post(path, handler);
        return this;
    };
    App.prototype.put = function (path, handler) {
        this.router.put(path, handler);
        return this;
    };
    App.prototype.delete = function (path, handler) {
        this.router.delete(path, handler);
        return this;
    };
    App.prototype.use = function (middleware) {
        // Implement middleware support if needed
        return this;
    };
    App.prototype.listen = function (port, callback) {
        var _this = this;
        var server = (0, node_http_1.createServer)(function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var bodyBuffer, bodyText, request, response, responseBody, headers, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!req.url) {
                            res.writeHead(400);
                            res.end('Bad Request');
                            return [2 /*return*/];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, , 6]);
                        return [4 /*yield*/, new Promise(function (resolve, reject) {
                                var chunks = [];
                                req.on('data', function (chunk) { return chunks.push(Buffer.from(chunk)); });
                                req.on('end', function () { return resolve(Buffer.concat(chunks)); });
                                req.on('error', reject);
                            })];
                    case 2:
                        bodyBuffer = _a.sent();
                        bodyText = bodyBuffer.toString('utf8');
                        request = new Request("http://".concat(req.headers.host).concat(req.url), {
                            method: req.method,
                            headers: new Headers(req.headers),
                            body: bodyText || null,
                            duplex: 'half'
                        });
                        return [4 /*yield*/, this.router.handle(request)];
                    case 3:
                        response = _a.sent();
                        return [4 /*yield*/, response.text()];
                    case 4:
                        responseBody = _a.sent();
                        headers = Object.fromEntries(response.headers);
                        res.writeHead(response.status, headers);
                        res.end(responseBody);
                        return [3 /*break*/, 6];
                    case 5:
                        error_1 = _a.sent();
                        console.error('Error:', error_1);
                        res.writeHead(500);
                        res.end('Internal Server Error');
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        }); });
        server.listen(port, callback);
        return server;
    };
    return App;
}());
exports.App = App;
