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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.stomp = void 0;
var stompjs_1 = require("@stomp/stompjs");
var sockjs_1 = require("sockjs-client/dist/sockjs");
var api_1 = require("../services/api");
var GameHubStompClient = /** @class */ (function () {
    function GameHubStompClient() {
        this.client = null;
        this.url = null;
        this.subs = new Map();
        this.listeners = new Set();
        this.offline = true;
    }
    GameHubStompClient.prototype.configure = function (url) {
        this.url = url;
        this.offline = !url;
    };
    GameHubStompClient.prototype.onStatus = function (cb) {
        var _this = this;
        this.listeners.add(cb);
        return function () { return _this.listeners.delete(cb); };
    };
    GameHubStompClient.prototype.emit = function (connected, reconnecting) {
        this.listeners.forEach(function (l) { return l(connected, reconnecting); });
    };
    GameHubStompClient.prototype.connect = function () {
        var _this = this;
        var _a;
        if (this.offline || !this.url) {
            this.emit(false, false);
            return;
        }
        if ((_a = this.client) === null || _a === void 0 ? void 0 : _a.active)
            return;
        var url = this.url;
        var isHttp = /^https?:\/\//i.test(url);
        this.client = new stompjs_1.Client(__assign(__assign({}, (isHttp
            ? {
                webSocketFactory: function () {
                    // Append JWT as a query parameter so the backend handshake interceptor
                    // can validate the token during the initial HTTP/SockJS handshake.
                    var token = api_1.tokenStore.get();
                    var target = token ? "".concat(url).concat(url.includes("?") ? "&" : "?", "token=").concat(encodeURIComponent(token)) : url;
                    return new sockjs_1.default(target, undefined, {
                        transports: ["websocket", "xhr-streaming", "xhr-polling"],
                    });
                },
            }
            : { brokerURL: url })), { reconnectDelay: 2500, heartbeatIncoming: 10000, heartbeatOutgoing: 10000, debug: function () { }, beforeConnect: function () {
                var token = api_1.tokenStore.get();
                _this.client.connectHeaders = token ? { Authorization: "Bearer ".concat(token) } : {};
            }, onConnect: function () {
                _this.emit(true, false);
                // re-subscribe everything
                var entries = Array.from(_this.subs.entries());
                _this.subs.clear();
                entries.forEach(function (_a) {
                    var dest = _a[0], handler = _a[1].handler;
                    return _this.subscribe(dest, handler);
                });
            }, onWebSocketClose: function () { return _this.emit(false, true); }, onStompError: function (frame) {
                console.error("[stomp] broker error", frame.headers["message"]);
                _this.emit(false, true);
            } }));
        this.client.activate();
    };
    GameHubStompClient.prototype.disconnect = function () {
        var _a;
        (_a = this.client) === null || _a === void 0 ? void 0 : _a.deactivate();
        this.subs.clear();
        this.emit(false, false);
    };
    GameHubStompClient.prototype.reconnect = function () {
        this.disconnect();
        this.connect();
    };
    GameHubStompClient.prototype.subscribe = function (destination, handler) {
        var _this = this;
        var _a;
        if (!((_a = this.client) === null || _a === void 0 ? void 0 : _a.connected)) {
            // Queue the handler — onConnect will rebind.
            this.subs.set(destination, { stomp: {}, handler: handler });
            return function () { return _this.unsubscribe(destination); };
        }
        var stomp = this.client.subscribe(destination, function (msg) {
            var body = msg.body;
            try {
                body = JSON.parse(msg.body);
            }
            catch (_a) {
                /* keep as raw */
            }
            handler(body, msg);
        });
        this.subs.set(destination, { stomp: stomp, handler: handler });
        return function () { return _this.unsubscribe(destination); };
    };
    GameHubStompClient.prototype.unsubscribe = function (destination) {
        var sub = this.subs.get(destination);
        if (sub === null || sub === void 0 ? void 0 : sub.stomp.unsubscribe)
            sub.stomp.unsubscribe();
        this.subs.delete(destination);
    };
    GameHubStompClient.prototype.sendMessage = function (destination, body) {
        var _a;
        if (this.offline || !((_a = this.client) === null || _a === void 0 ? void 0 : _a.connected))
            return false;
        console.debug("[stomp] publish", destination, body);
        this.client.publish({
            destination: destination,
            body: typeof body === "string" ? body : JSON.stringify(body),
        });
        return true;
    };
    Object.defineProperty(GameHubStompClient.prototype, "isOffline", {
        get: function () {
            return this.offline;
        },
        enumerable: false,
        configurable: true
    });
    return GameHubStompClient;
}());
exports.stomp = new GameHubStompClient();
exports.stomp.configure(typeof window !== "undefined"
    ? ((_a = import.meta.env.VITE_STOMP_URL) !== null && _a !== void 0 ? _a : null)
    : null);
