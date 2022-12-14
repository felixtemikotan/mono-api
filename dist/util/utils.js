"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.options = exports.generateToken = exports.monoSessionLoginSchema = exports.getTransactionHistorySchema = exports.updateBankAccountSchema = exports.captureChargeSchema = exports.createChargeSchema = exports.confirmPaymentVerificationSchema = exports.createBankAccountSchema = exports.createMonoSessionSchema = exports.monoLoginSchema = exports.loginUserSchema = exports.otpLoginSchema = exports.updateUserSchema = exports.directpaySessionSchema = exports.createUserSchema = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const joi_1 = __importDefault(require("joi"));
dotenv_1.default.config();
exports.createUserSchema = joi_1.default.object({
    firstname: joi_1.default.string().required(),
    lastname: joi_1.default.string().required(),
    username: joi_1.default.string().required(),
    email: joi_1.default.string().email().required(),
    phonenumber: joi_1.default.string().length(11).pattern(/^[0-9]+$/).required(),
    password: joi_1.default.string().required(),
    confirmPassword: joi_1.default.ref('password')
}).with('password', 'confirmPassword');
exports.directpaySessionSchema = joi_1.default.object({
    amount: joi_1.default.string().required(),
    description: joi_1.default.string().required(),
});
exports.updateUserSchema = joi_1.default.object({
    firstname: joi_1.default.string(),
    lastname: joi_1.default.string(),
    email: joi_1.default.string().email(),
    phonenumber: joi_1.default.string().length(11).pattern(/^[0-9]+$/),
});
exports.otpLoginSchema = joi_1.default.object({
    otp: joi_1.default.string().required(),
    sessionId: joi_1.default.string().required(),
});
exports.loginUserSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().required()
});
exports.monoLoginSchema = joi_1.default.object({
    username: joi_1.default.string().required(),
    password: joi_1.default.string().required(),
    sessionId: joi_1.default.string().required()
});
exports.createMonoSessionSchema = joi_1.default.object({
    institution: joi_1.default.string().required(),
    auth_method: joi_1.default.string().required(),
});
exports.createBankAccountSchema = joi_1.default.object({
    accountnumber: joi_1.default.string().required().length(10).pattern(/^[0-9]+$/),
    accountname: joi_1.default.string().required(),
    bankname: joi_1.default.string().required(),
    accounttype: joi_1.default.string().required(),
    banktransactiontype: joi_1.default.string().required(),
    servicetype: joi_1.default.string().required(),
    username: joi_1.default.string().required(),
    password: joi_1.default.string().required(),
    confirmPassword: joi_1.default.ref('password')
}).with('password', 'confirmPassword');
exports.confirmPaymentVerificationSchema = joi_1.default.object({
    answer: joi_1.default.string().required(),
    token: joi_1.default.string().required(),
    bvn: joi_1.default.string().required(),
    pin: joi_1.default.string().required(),
});
exports.createChargeSchema = joi_1.default.object({
    token: joi_1.default.string().required(),
    answer: joi_1.default.string().required(),
    otp: joi_1.default.string().required(),
});
exports.captureChargeSchema = joi_1.default.object({
    answer: joi_1.default.string().required(),
    token: joi_1.default.string().required(),
    pin: joi_1.default.string().required(),
    bvn: joi_1.default.string().required(),
});
exports.updateBankAccountSchema = joi_1.default.object({
    accountnumber: joi_1.default.string().length(10).pattern(/^[0-9]+$/),
    accountname: joi_1.default.string(),
    bankname: joi_1.default.string(),
    accounttype: joi_1.default.string(),
    banktransactiontype: joi_1.default.string(),
    servicetype: joi_1.default.string(),
    username: joi_1.default.string(),
    password: joi_1.default.string(),
    confirmPassword: joi_1.default.ref('password')
}).with('password', 'confirmPassword');
exports.getTransactionHistorySchema = joi_1.default.object({
    duration: joi_1.default.string().max(2).required(),
});
exports.monoSessionLoginSchema = joi_1.default.object({
    institution: joi_1.default.string().required()
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
