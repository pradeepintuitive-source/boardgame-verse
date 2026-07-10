"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = exports.api = exports.tokenStore = exports.REFRESH_STORAGE_KEY = exports.TOKEN_STORAGE_KEY = exports.API_BASE_URL = void 0;
exports.setUnauthorizedHandler = setUnauthorizedHandler;
exports.apiErrorMessage = apiErrorMessage;
exports.apiErrorDetails = apiErrorDetails;
var axios_1 = require("axios");
var sonner_1 = require("sonner");
/**
 * Axios instance for REST calls to the GameHub Spring Boot backend.
 * Base URL is configurable via VITE_API_URL.
 *
 * Backend response contract:
 *   Success: { timestamp, status, message, data, details, path }
 *   Error:   { timestamp, status, error, message, details, path }
 *
 * A response interceptor unwraps `response.data.data` so all service call
 * sites can keep using `response.data` as the payload. Errors are
 * normalized into `ApiError` and surfaced via toast.
 */
exports.API_BASE_URL = (_a = import.meta.env.VITE_API_URL) !== null && _a !== void 0 ? _a : "/api";
exports.TOKEN_STORAGE_KEY = "gh.jwt";
exports.REFRESH_STORAGE_KEY = "gh.jwt.refresh";
exports.tokenStore = {
    get: function () {
        if (typeof window === "undefined")
            return null;
        return localStorage.getItem(exports.TOKEN_STORAGE_KEY);
    },
    set: function (token) {
        if (typeof window === "undefined")
            return;
        if (token)
            localStorage.setItem(exports.TOKEN_STORAGE_KEY, token);
        else
            localStorage.removeItem(exports.TOKEN_STORAGE_KEY);
    },
    getRefresh: function () {
        if (typeof window === "undefined")
            return null;
        return localStorage.getItem(exports.REFRESH_STORAGE_KEY);
    },
    setRefresh: function (token) {
        if (typeof window === "undefined")
            return;
        if (token)
            localStorage.setItem(exports.REFRESH_STORAGE_KEY, token);
        else
            localStorage.removeItem(exports.REFRESH_STORAGE_KEY);
    },
    clear: function () {
        exports.tokenStore.set(null);
        exports.tokenStore.setRefresh(null);
    },
};
exports.api = axios_1.default.create({
    baseURL: exports.API_BASE_URL,
    timeout: 15000,
    withCredentials: false,
    headers: {
        "Content-Type": "application/json",
        // ngrok free tier interstitial bypass — harmless against any other host
        "ngrok-skip-browser-warning": "true",
    },
});
var ApiError = /** @class */ (function (_super) {
    __extends(ApiError, _super);
    function ApiError(init) {
        var _a, _b;
        var _this = _super.call(this, init.message) || this;
        _this.name = "ApiError";
        _this.status = init.status;
        _this.error = (_a = init.error) !== null && _a !== void 0 ? _a : "Error";
        _this.details = (_b = init.details) !== null && _b !== void 0 ? _b : [];
        _this.path = init.path;
        return _this;
    }
    return ApiError;
}(Error));
exports.ApiError = ApiError;
function isApiResponse(body) {
    return (!!body &&
        typeof body === "object" &&
        "status" in body &&
        "data" in body &&
        "path" in body);
}
// Attach bearer token on every request
exports.api.interceptors.request.use(function (config) {
    var _a;
    var token = exports.tokenStore.get();
    if (token) {
        config.headers = (_a = config.headers) !== null && _a !== void 0 ? _a : {};
        config.headers.Authorization = "Bearer ".concat(token);
    }
    return config;
});
var onUnauthorized = null;
function setUnauthorizedHandler(cb) {
    onUnauthorized = cb;
}
exports.api.interceptors.response.use(function (r) {
    var _a, _b;
    // Unwrap ApiResponse<T> so services can keep reading `response.data`
    // as the payload. Void endpoints yield `null`.
    if (isApiResponse(r.data)) {
        var wrapped = r.data;
        if (wrapped.details && wrapped.details.length > 0) {
            console.info("[api]", r.config.url, wrapped.message, wrapped.details);
        }
        var method = ((_a = r.config.method) !== null && _a !== void 0 ? _a : "get").toLowerCase();
        var silent = ((_b = r.config.headers) === null || _b === void 0 ? void 0 : _b["X-Silent-Toast"]) === "true";
        if (!silent &&
            method !== "get" &&
            wrapped.message &&
            wrapped.message.toLowerCase() !== "ok") {
            sonner_1.toast.success(wrapped.message);
        }
        r.data = wrapped.data;
    }
    return r;
}, function (err) {
    var _a, _b, _c, _d, _e, _f, _g;
    var status = (_a = err.response) === null || _a === void 0 ? void 0 : _a.status;
    var body = (_b = err.response) === null || _b === void 0 ? void 0 : _b.data;
    var message = (_e = (_d = (_c = body === null || body === void 0 ? void 0 : body.message) !== null && _c !== void 0 ? _c : body === null || body === void 0 ? void 0 : body.error) !== null && _d !== void 0 ? _d : err.message) !== null && _e !== void 0 ? _e : "Request failed";
    var details = (_f = body === null || body === void 0 ? void 0 : body.details) !== null && _f !== void 0 ? _f : [];
    if (status === 401) {
        exports.tokenStore.clear();
        onUnauthorized === null || onUnauthorized === void 0 ? void 0 : onUnauthorized();
    }
    console.warn("[api]", status, message, details);
    var apiError = new ApiError({
        message: message,
        status: status !== null && status !== void 0 ? status : 0,
        error: body === null || body === void 0 ? void 0 : body.error,
        details: details,
        path: body === null || body === void 0 ? void 0 : body.path,
    });
    // Global toast — silence 401s (handled by auth flow) and network aborts.
    if (status && status !== 401) {
        sonner_1.toast.error((_g = body === null || body === void 0 ? void 0 : body.error) !== null && _g !== void 0 ? _g : "Request failed", {
            description: details.length > 0 ? details.join("\n") : message,
        });
    }
    else if (!err.response) {
        sonner_1.toast.error("Network error", { description: err.message });
    }
    return Promise.reject(apiError);
});
function apiErrorMessage(err) {
    var _a, _b, _c;
    if (err instanceof ApiError) {
        return err.details.length > 0
            ? "".concat(err.message, ": ").concat(err.details.join(", "))
            : err.message;
    }
    if (axios_1.default.isAxiosError(err)) {
        var data = (_a = err.response) === null || _a === void 0 ? void 0 : _a.data;
        return (_c = (_b = data === null || data === void 0 ? void 0 : data.message) !== null && _b !== void 0 ? _b : data === null || data === void 0 ? void 0 : data.error) !== null && _c !== void 0 ? _c : err.message;
    }
    return err instanceof Error ? err.message : "Unknown error";
}
function apiErrorDetails(err) {
    var _a, _b;
    if (err instanceof ApiError)
        return err.details;
    if (axios_1.default.isAxiosError(err)) {
        var data = (_a = err.response) === null || _a === void 0 ? void 0 : _a.data;
        return (_b = data === null || data === void 0 ? void 0 : data.details) !== null && _b !== void 0 ? _b : [];
    }
    return [];
}
