"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initials = exports.pickAvatarColor = exports.roomCode = exports.uid = void 0;
var uid = function (prefix) {
    if (prefix === void 0) { prefix = "id"; }
    return "".concat(prefix, "_").concat(Math.random().toString(36).slice(2, 9)).concat(Date.now().toString(36).slice(-4));
};
exports.uid = uid;
var roomCode = function () {
    return Array.from({ length: 5 }, function () { return "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 32)]; }).join("");
};
exports.roomCode = roomCode;
var palette = [
    "#00f2ff",
    "#ff00e5",
    "#facc15",
    "#4ade80",
    "#a78bfa",
    "#fb7185",
    "#38bdf8",
    "#fb923c",
    "#34d399",
    "#f472b6",
];
var pickAvatarColor = function (seed) {
    if (!seed)
        return palette[Math.floor(Math.random() * palette.length)];
    var h = 0;
    for (var _i = 0, seed_1 = seed; _i < seed_1.length; _i++) {
        var c = seed_1[_i];
        h = (h * 31 + c.charCodeAt(0)) >>> 0;
    }
    return palette[h % palette.length];
};
exports.pickAvatarColor = pickAvatarColor;
var initials = function (name) {
    return name
        .split(/\s+/)
        .map(function (p) { return p[0]; })
        .join("")
        .slice(0, 2)
        .toUpperCase();
};
exports.initials = initials;
