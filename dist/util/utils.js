"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.options = exports.generateToken = exports.createBankAccount = exports.loginUser = exports.createUser = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const joi_1 = __importDefault(require("joi"));
dotenv_1.default.config();
exports.createUser = joi_1.default.object({
    firstname: joi_1.default.string().required(),
    lastname: joi_1.default.string().required(),
    username: joi_1.default.string().required(),
    email: joi_1.default.string().email().required(),
    phonenumber: joi_1.default.string().length(11).pattern(/^[0-9]+$/).required(),
    password: joi_1.default.string().required(),
    confirmPassword: joi_1.default.ref('password')
}).with('password', 'confirmPassword');
exports.loginUser = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().required()
});
exports.createBankAccount = joi_1.default.object({
    accountnumber: joi_1.default.string().required().length(10).pattern(/^[0-9]+$/),
    accountname: joi_1.default.string().required(),
    bankname: joi_1.default.string().required(),
    accounttype: joi_1.default.string().required()
});
const generateToken = (user) => {
    const pass = process.env.JWT_SECRET;
    return jsonwebtoken_1.default.sign(user, pass, { expiresIn: '7d' });
};
exports.generateToken = generateToken;
exports.options = {
    abortEarly: false,
    errors: {
        wrap: {
            label: ''
        }
    }
};
