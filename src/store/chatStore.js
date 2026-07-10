"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useChatStore = void 0;
var zustand_1 = require("zustand");
var chat_1 = require("../services/chat");
var ids_1 = require("../utils/ids");
function mapChatResponse(roomId, response) {
    return {
        id: response.id,
        roomId: roomId,
        userId: response.senderUserId,
        username: response.senderName,
        avatarColor: (0, ids_1.pickAvatarColor)(response.senderName),
        text: response.content,
        ts: new Date(response.sentAt).getTime(),
        channel: "public",
    };
}
exports.useChatStore = (0, zustand_1.create)(function (set) { return ({
    messages: {},
    typing: {},
    drawerOpen: false,
    unread: {},
    send: function (roomId, msg) { return __awaiter(void 0, void 0, void 0, function () {
        var response, next;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, chat_1.chatApi.sendMessage(roomId, msg.text, null)];
                case 1:
                    response = _a.sent();
                    next = mapChatResponse(roomId, response);
                    set(function (s) {
                        var _a;
                        var _b;
                        return ({
                            messages: __assign(__assign({}, s.messages), (_a = {}, _a[roomId] = __spreadArray(__spreadArray([], ((_b = s.messages[roomId]) !== null && _b !== void 0 ? _b : []), true), [next], false), _a)),
                        });
                    });
                    return [2 /*return*/];
            }
        });
    }); },
    loadHistory: function (roomId) { return __awaiter(void 0, void 0, void 0, function () {
        var history;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, chat_1.chatApi.history(roomId)];
                case 1:
                    history = _a.sent();
                    set(function (s) {
                        var _a;
                        return ({
                            messages: __assign(__assign({}, s.messages), (_a = {}, _a[roomId] = history.map(function (message) { return mapChatResponse(roomId, message); }), _a)),
                        });
                    });
                    return [2 /*return*/];
            }
        });
    }); },
    receiveMessage: function (roomId, msg) {
        return set(function (s) {
            var _a, _b;
            var _c, _d;
            var next = mapChatResponse(roomId, msg);
            var list = __spreadArray(__spreadArray([], ((_c = s.messages[roomId]) !== null && _c !== void 0 ? _c : []), true), [next], false);
            var unread = s.drawerOpen
                ? s.unread
                : __assign(__assign({}, s.unread), (_a = {}, _a[roomId] = ((_d = s.unread[roomId]) !== null && _d !== void 0 ? _d : 0) + 1, _a));
            return { messages: __assign(__assign({}, s.messages), (_b = {}, _b[roomId] = list, _b)), unread: unread };
        });
    },
    toggleDrawer: function () {
        return set(function (s) { return ({ drawerOpen: !s.drawerOpen, unread: !s.drawerOpen ? {} : s.unread }); });
    },
    clearUnread: function (roomId) { return set(function (s) {
        var _a;
        return ({ unread: __assign(__assign({}, s.unread), (_a = {}, _a[roomId] = 0, _a)) });
    }); },
    setTyping: function (roomId, usernames) { return set(function (s) {
        var _a;
        return ({ typing: __assign(__assign({}, s.typing), (_a = {}, _a[roomId] = usernames, _a)) });
    }); },
}); });
