"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_vars_1 = __importDefault(require("../shared/env-vars"));
// **** Variables **** //
// Errors
const errors = {
    validation: 'JSON-web-token validation failed.',
};
// Options
const options = {
    expiresIn: env_vars_1.default.jwt.exp,
};
// **** Functions **** //
/**
 * Encrypt data and return jwt.
 */
function sign(data) {
    return new Promise((res, rej) => {
        jsonwebtoken_1.default.sign(data, env_vars_1.default.jwt.secret, options, (err, token) => {
            return err ? rej(err) : res(token || '');
        });
    });
}
/**
 * Decrypt JWT and extract client data.
 */
function decode(jwt) {
    return new Promise((res, rej) => {
        jsonwebtoken_1.default.verify(jwt, env_vars_1.default.jwt.secret, (err, decoded) => {
            return err ? rej(errors.validation) : res(decoded);
        });
    });
}
// **** Export default **** //
exports.default = {
    sign,
    decode,
};
