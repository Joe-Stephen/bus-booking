"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = void 0;
exports.logError = logError;
const morgan_1 = __importDefault(require("morgan"));
// ANSI colour codes - no external dependencies needed
const c = {
    reset: "\x1b[0m",
    gray: "\x1b[90m",
    white: "\x1b[37m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    cyan: "\x1b[36m",
    red: "\x1b[31m",
    bold: "\x1b[1m",
};
function methodColor(method) {
    switch (method) {
        case "GET": return c.green;
        case "POST": return c.yellow;
        case "PUT":
        case "PATCH": return c.blue;
        case "DELETE": return c.red;
        default: return c.white;
    }
}
function statusColor(status) {
    const code = Number(status ?? 500);
    if (code >= 500)
        return c.red;
    if (code >= 400)
        return c.yellow;
    if (code >= 300)
        return c.cyan;
    return c.green;
}
exports.requestLogger = (0, morgan_1.default)((tokens, req, res) => {
    const method = tokens.method(req, res) ?? "-";
    const url = tokens.url(req, res) ?? "-";
    const status = tokens.status(req, res) ?? "???";
    const time = tokens["response-time"](req, res) ?? "-";
    const ts = new Date().toISOString();
    return [
        `${c.gray}${ts}${c.reset}`,
        `${methodColor(method)}${c.bold}[${method}]${c.reset}`,
        `${c.white}${url}${c.reset}`,
        `${statusColor(status)}${c.bold}${status}${c.reset}`,
        `${c.gray}${time} ms${c.reset}`,
    ].join("  ");
});
// Utility for structured error logging – call this in catch blocks
function logError(context, error) {
    const ts = new Date().toISOString();
    console.error(`${c.red}${c.bold}[ERROR]${c.reset} ${c.gray}${ts}${c.reset} ${c.red}${context}${c.reset}`, error);
}
