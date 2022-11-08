"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_repo_1 = __importDefault(require("@repos/user-repo"));
const errors_1 = require("@shared/errors");
// **** Functions **** //
/**
 * Get all users.
 */
function getAll() {
    return user_repo_1.default.getAll();
}
/**
 * Add one user.
 */
function addOne(user) {
    return user_repo_1.default.add(user);
}
/**
 * Update one user.
 */
async function updateOne(user) {
    const persists = await user_repo_1.default.persists(user.id);
    if (!persists) {
        throw new errors_1.UserNotFoundError();
    }
    return user_repo_1.default.update(user);
}
/**
 * Delete a user by their id.
 */
async function _delete(id) {
    const persists = await user_repo_1.default.persists(id);
    if (!persists) {
        throw new errors_1.UserNotFoundError();
    }
    return user_repo_1.default.delete(id);
}
// **** Export default **** //
exports.default = {
    getAll,
    addOne,
    updateOne,
    delete: _delete,
};
