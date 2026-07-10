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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatDrawer = ChatDrawer;
var framer_motion_1 = require("framer-motion");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var chatStore_1 = require("../../store/chatStore");
var authStore_1 = require("../../store/authStore");
var Avatar_1 = require("../common/Avatar");
var useStompSubscription_1 = require("../../hooks/useStompSubscription");
var topics_1 = require("../../websocket/topics");
function ChatDrawer(_a) {
    var _this = this;
    var _b, _c;
    var roomId = _a.roomId;
    var _d = (0, chatStore_1.useChatStore)(), drawerOpen = _d.drawerOpen, toggleDrawer = _d.toggleDrawer, messages = _d.messages, send = _d.send, unread = _d.unread, clearUnread = _d.clearUnread, loadHistory = _d.loadHistory, receiveMessage = _d.receiveMessage;
    var user = (0, authStore_1.useAuthStore)(function (s) { return s.user; });
    var _e = (0, react_1.useState)(""), text = _e[0], setText = _e[1];
    var list = (_b = messages[roomId]) !== null && _b !== void 0 ? _b : [];
    var unreadCount = (_c = unread[roomId]) !== null && _c !== void 0 ? _c : 0;
    (0, react_1.useEffect)(function () {
        if (!roomId)
            return;
        loadHistory(roomId).catch(function (error) { return console.error("[chat] failed to load history", error); });
    }, [roomId, loadHistory]);
    (0, useStompSubscription_1.useStompSubscription)(roomId ? topics_1.Topics.roomChat(roomId) : null, function (msg) {
        var _a;
        if (!msg || msg.type !== "CHAT_MESSAGE")
            return;
        var payload = (_a = msg.payload) !== null && _a !== void 0 ? _a : msg;
        receiveMessage(roomId, payload);
    }, !!roomId);
    (0, react_1.useEffect)(function () {
        if (!drawerOpen || !roomId)
            return;
        clearUnread(roomId);
    }, [drawerOpen, roomId, clearUnread]);
    var submit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    if (!text.trim() || !user)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, send(roomId, {
                            userId: user.id,
                            username: user.username,
                            avatarColor: user.avatarColor,
                            text: text.trim(),
                            channel: "public",
                        })];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error("[chat] failed to send message", error_1);
                    return [3 /*break*/, 4];
                case 4:
                    setText("");
                    return [2 /*return*/];
            }
        });
    }); };
    return (<>
      <button onClick={toggleDrawer} aria-label="Toggle chat" className="fixed bottom-20 right-6 z-50 size-14 rounded-full bg-accent-cyan text-black grid place-items-center shadow-[var(--shadow-neon-cyan)] hover:scale-110 transition-transform">
        <lucide_react_1.MessageSquare className="size-6"/>
        {unreadCount > 0 && (<span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 grid place-items-center rounded-full bg-accent-pink text-white text-[10px] font-bold">
            {unreadCount}
          </span>)}
      </button>

      <framer_motion_1.AnimatePresence>
        {drawerOpen && (<framer_motion_1.motion.aside initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ duration: 0.35, ease: [0.19, 1, 0.22, 1] }} className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm bg-card border-l border-white/10 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-accent-cyan">
                  Live Channel
                </div>
                <div className="font-display text-2xl italic uppercase">Chat</div>
              </div>
              <button onClick={toggleDrawer} className="p-2 hover:text-accent-cyan transition-colors">
                <lucide_react_1.X className="size-5"/>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {list.length === 0 && (<p className="text-white/40 text-sm font-mono">No messages yet. Say something.</p>)}
              <framer_motion_1.AnimatePresence initial={false}>
                {list.map(function (m) { return (<framer_motion_1.motion.div key={m.id} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="flex gap-3">
                    <Avatar_1.Avatar name={m.username} color={m.avatarColor} size={28}/>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="font-bold text-sm" style={{ color: m.avatarColor }}>
                          {m.username}
                        </span>
                        <span className="text-[9px] font-mono text-white/30 uppercase">
                          {new Date(m.ts).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                })}
                        </span>
                      </div>
                      <p className="text-sm text-white/80 break-words">{m.text}</p>
                    </div>
                  </framer_motion_1.motion.div>); })}
              </framer_motion_1.AnimatePresence>
            </div>

            <form onSubmit={submit} className="p-4 border-t border-white/10 flex gap-2">
              <input value={text} onChange={function (e) { return setText(e.target.value); }} placeholder="Type a message..." className="flex-1 bg-background border border-white/10 px-3 py-2 text-sm font-mono outline-none focus:border-accent-cyan transition-colors"/>
              <button type="submit" className="size-10 grid place-items-center bg-accent-cyan text-black hover:bg-white transition-colors disabled:opacity-40" disabled={!text.trim()}>
                <lucide_react_1.Send className="size-4"/>
              </button>
            </form>
          </framer_motion_1.motion.aside>)}
      </framer_motion_1.AnimatePresence>
    </>);
}
