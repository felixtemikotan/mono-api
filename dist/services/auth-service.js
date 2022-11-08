"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_repo_1 = __importDefault(require("@repos/user-repo"));
const jwt_util_1 = __importDefault(require("@util/jwt-util"));
const errors_1 = require("@shared/errors");
// **** Functions **** //
/**
 * Login a user.
 */
async function getJwt(email, password) {
    // Fetch user
    const user = await user_repo_1.default.getOne(email);
    if (!user) {
        throw new errors_1.UnauthorizedError();
    }
    // Check password
    const hash = (user.pwdHash ?? '');
    const pwdPassed = await bcrypt_1.default.compare(password, hash);
    if (!pwdPassed) {
        throw new errors_1.UnauthorizedError();
    }
    // Setup Admin Cookie
    return jwt_util_1.default.sign({
        id: user.id,
        email: user.name,
        name: user.name,
        role: user.role,
    });
}
// **** Export default **** //
exports.default = {
    getJwt,
};
