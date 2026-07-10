"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useStompSubscription = useStompSubscription;
var react_1 = require("react");
var stompClient_1 = require("../websocket/stompClient");
function useStompSubscription(destination, handler, enabled) {
    if (enabled === void 0) { enabled = true; }
    (0, react_1.useEffect)(function () {
        if (!destination || !enabled)
            return;
        var off = stompClient_1.stomp.subscribe(destination, function (body) { return handler(body); });
        return off;
    }, [destination, enabled, handler]);
}
