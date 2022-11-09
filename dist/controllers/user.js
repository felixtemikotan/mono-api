"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenSignin = exports.createMonoSession = exports.monoLogin = exports.getAllBankAccounts = exports.deleteBankAccount = exports.updateBankAccount = exports.createBankAccount = exports.getAllUsers = exports.getUser = exports.deleteUser = exports.updateUser = exports.loginUser = exports.createUser = void 0;
const uuid_1 = require("uuid");
const users_1 = require("../models/users");
const bankaccount_1 = require("../models/bankaccount");
const utils_1 = require("../util/utils");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const request_1 = __importDefault(require("request"));
const monoapi_1 = require("./monoapi");
const axios_1 = __importDefault(require("axios"));
const secret = process.env.JWT_SECRET;
const monoSecretKey = process.env.MONO_SECRET_KEY;
const monoAppId = process.env.MONO_APP_ID;
const monoBaseUrl = process.env.BASE_API_URL;
async function createUser(req, res, next) {
    try {
        const { error } = utils_1.createUserSchema.validate(req.body, utils_1.options);
        if (error) {
            return res.status(400).json({ status: 400, error: error.details[0].message });
        }
        const { firstname, lastname, username, email, phonenumber, password } = req.body;
        const duplicateEmail = await users_1.UserInstance.findOne({ where: { email } });
        if (duplicateEmail) {
            return res.status(409).json({ status: 409, error: 'Email already exist' });
        }
        const duplicateUsername = await users_1.UserInstance.findOne({ where: { username } });
        if (duplicateUsername) {
            return res.status(409).json({ status: 409, error: 'Username already exist' });
        }
        const duplicatePhonenumber = await users_1.UserInstance.findOne({ where: { phonenumber } });
        if (duplicatePhonenumber) {
            return res.status(409).json({ status: 409, error: 'Phonenumber already exist' });
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(password, salt);
        const id = (0, uuid_1.v4)();
        const user = await users_1.UserInstance.create({
            id,
            firstname,
            lastname,
            username,
            email,
            phonenumber,
            password: hashedPassword,
        });
        return res.status(201).json({ status: 201, msg: 'User created successfully', user });
    }
    catch (error) {
        return res.status(500).json({ status: 500, error: error.message });
    }
}
exports.createUser = createUser;
async function loginUser(req, res, next) {
    try {
        const { error } = utils_1.loginUserSchema.validate(req.body, utils_1.options);
        if (error) {
            return res.status(400).json({ status: 400, error: error.details[0].message });
        }
        const { email, password } = req.body;
        const user = await users_1.UserInstance.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ status: 400, error: 'Invalid email or password' });
        }
        const validPassword = bcryptjs_1.default.compareSync(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ status: 400, error: 'Invalid email or password' });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id }, secret);
        return res.status(200).json({ status: 200, msg: 'User logged in successfully', token, user });
    }
    catch (error) {
        return res.status(500).json({ status: 500, error: error.message });
    }
}
exports.loginUser = loginUser;
async function updateUser(req, res, next) {
    try {
        const { id } = req.params;
        const { error } = utils_1.updateUserSchema.validate(req.body, utils_1.options);
        if (error) {
            return res.status(400).json({ status: 400, error: error.details[0].message });
        }
        const { firstname, lastname, email, phonenumber } = req.body;
        const user = await users_1.UserInstance.findOne({ where: { id } });
        if (!user) {
            return res.status(404).json({ status: 404, error: 'User not found' });
        }
        const record = await users_1.UserInstance.update({ firstname, lastname, email, phonenumber }, { where: { id } });
        return res.status(200).json({ status: 200, msg: 'User updated successfully', record });
    }
    catch (error) {
        return res.status(500).json({ status: 500, error: error.message });
    }
}
exports.updateUser = updateUser;
async function deleteUser(req, res, next) {
    try {
        const { id } = req.params;
        const user = await users_1.UserInstance.findOne({ where: { id } });
        if (!user) {
            return res.status(404).json({ status: 404, error: 'User not found' });
        }
        await users_1.UserInstance.destroy({ where: { id } });
        return res.status(200).json({ status: 200, msg: 'User deleted successfully' });
    }
    catch (error) {
        return res.status(500).json({ status: 500, error: error.message });
    }
}
exports.deleteUser = deleteUser;
async function getUser(req, res, next) {
    try {
        const { id } = req.params;
        const user = await users_1.UserInstance.findOne({ where: { id },
            include: [{ model: bankaccount_1.BankAccountInstance, as: "bankaccounts" }],
        });
        if (!user) {
            return res.status(404).json({ status: 404, error: 'User not found' });
        }
        return res.status(200).json({ status: 200, msg: 'User found successfully', user });
    }
    catch (error) {
        return res.status(500).json({ status: 500, error: error.message });
    }
}
exports.getUser = getUser;
async function getAllUsers(req, res, next) {
    try {
        const users = await users_1.UserInstance.findAll();
        return res.status(200).json({ status: 200, msg: 'Users found successfully', users });
    }
    catch (error) {
        return res.status(500).json({ status: 500, error: error.message });
    }
}
exports.getAllUsers = getAllUsers;
async function createBankAccount(req, res, next) {
    try {
        const userId = req.user.id;
        const { error } = utils_1.createBankAccountSchema.validate(req.body, utils_1.options);
        if (error) {
            return res.status(400).json({ status: 400, error: error.details[0].message });
        }
        const { accountnumber, accountname, bankname, bankcode, accounttype, banktransactiontype } = req.body;
        const duplicateAccountnumber = await bankaccount_1.BankAccountInstance.findOne({ where: { accountnumber } });
        if (duplicateAccountnumber) {
            return res.status(409).json({ status: 409, error: 'Accountnumber already exist' });
        }
        const id = (0, uuid_1.v4)();
        const tokenizedAccountnumber = jsonwebtoken_1.default.sign({ accountnumber: accountnumber }, secret);
        let decryptedAccountNumber = jsonwebtoken_1.default.verify(tokenizedAccountnumber, secret);
        const { data } = await (0, monoapi_1.getAllBanksNG)();
        const banksData = data.map((bank) => {
            let allBanksData = {};
            allBanksData.bankId = bank._id;
            allBanksData.bankname = bank.name;
            allBanksData.type = bank.type;
            return allBanksData;
        });
        const bankCode = banksData.filter((item) => {
            if (item.bankname.toLowerCase() == bankname.toLowerCase() && item.type.toLowerCase() == banktransactiontype.toLowerCase())
                return item;
        });
        if (bankCode.length == 0) {
            return res.status(404).json({ status: 404, msg: 'Bank not found', banksData });
        }
        let code = bankCode[0].bankId;
        console.log(bankCode);
        const bankaccount = await bankaccount_1.BankAccountInstance.create({
            id: id,
            userId: userId,
            accountnumber: tokenizedAccountnumber,
            accountname: accountname,
            bankname: bankname,
            bankcode: code,
            accounttype: accounttype,
            banktransactiontype: banktransactiontype,
        });
        return res.status(201).json({ status: 201, msg: 'Bank Account created successfully', bankaccount });
    }
    catch (error) {
        return res.status(500).json({ status: 500, error: error.message });
    }
}
exports.createBankAccount = createBankAccount;
async function updateBankAccount(req, res, next) {
    try {
        const { id } = req.params;
        const { error } = utils_1.updateBankAccountSchema.validate(req.body, utils_1.options);
        if (error) {
            return res.status(400).json({ status: 400, error: error.details[0].message });
        }
        const { accountnumber, accountname, bankname, accounttype, banktransactiontype } = req.body;
        const bankaccount = await bankaccount_1.BankAccountInstance.findOne({ where: { id } });
        if (!bankaccount) {
            return res.status(404).json({ status: 404, error: 'Bank Account not found' });
        }
        const tokenizedAccountnumber = jsonwebtoken_1.default.sign({ accountnumber: accountnumber }, secret);
        const { data } = await (0, monoapi_1.getAllBanksNG)();
        const banksData = data.map((bank) => {
            let allBanksData = {};
            allBanksData.bankId = bank._id;
            allBanksData.bankname = bank.name;
            allBanksData.type = bank.type;
            return allBanksData;
        });
        const bankCode = banksData.filter((item) => item.bankname.toLowerCase() == bankname.toLowerCase());
        if (bankCode.length == 0) {
            return res.status(404).json({ status: 404, msg: 'Bank not found', banksData });
        }
        let code = bankCode[0].bankId;
        const record = await bankaccount_1.BankAccountInstance.update({ accountnumber: tokenizedAccountnumber, accountname: accountname,
            bankname: bankname, bankcode: code, accounttype: accounttype, banktransactiontype: banktransactiontype }, { where: { id } });
        return res.status(200).json({ status: 200, msg: 'Bank Account updated successfully', record });
    }
    catch (error) {
        return res.status(500).json({ status: 500, error: error.message });
    }
}
exports.updateBankAccount = updateBankAccount;
async function deleteBankAccount(req, res, next) {
    try {
        const { id } = req.params;
        const bankaccount = await bankaccount_1.BankAccountInstance.findOne({ where: { id } });
        if (!bankaccount) {
            return res.status(404).json({ status: 404, error: 'Bank Account not found' });
        }
        await bankaccount_1.BankAccountInstance.destroy({ where: { id } });
        return res.status(200).json({ status: 200, msg: 'Bank Account deleted successfully' });
    }
    catch (error) {
        return res.status(500).json({ status: 500, error: error.message });
    }
}
exports.deleteBankAccount = deleteBankAccount;
async function getAllBankAccounts(req, res, next) {
    try {
        const userId = req.params.userId;
        const bankaccounts = await bankaccount_1.BankAccountInstance.findAll({ where: { userId } });
        return res.status(200).json({ status: 200, msg: 'Bank Accounts found successfully', bankaccounts });
    }
    catch (error) {
        return res.status(500).json({ status: 500, error: error.message });
    }
}
exports.getAllBankAccounts = getAllBankAccounts;
async function monoLogin(req, res, next) {
    try {
        const { error } = utils_1.monoLoginSchema.validate(req.body, utils_1.options);
        if (error) {
            return res.status(400).json({ status: 400, error: error.details[0].message });
        }
        const { username, password, sessionId } = req.body;
        const monoUrl = `${monoBaseUrl}/v1/connect/login`;
        const option = {
            'method': 'POST',
            'url': monoUrl,
            'headers': {
                Accept: 'application/json',
                'mono-sec-key': monoSecretKey,
                'x-session-id': sessionId,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: username, password: password })
        };
        (0, request_1.default)(option, function (error, response) {
            if (error) {
                return res.status(400).json({ status: 400, error: error });
            }
            const result = JSON.parse(response.body);
            return res.status(200).json({ status: 200, msg: 'Mono Login successful', result });
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, error: error.message });
    }
}
exports.monoLogin = monoLogin;
async function createMonoSession(req, res, next) {
    try {
        const { error } = utils_1.createMonoSessionSchema.validate(req.body, utils_1.options);
        if (error) {
            return res.status(400).json({ status: 400, error: error.details[0].message });
        }
        const { institution, auth_method } = req.body;
        const BASE_API_URL = 'https://api.withmono.com';
        const response = await axios_1.default.post(`${BASE_API_URL}/v1/connect/session`, {
            app: monoAppId,
            institution: institution,
            auth_method: auth_method
        }, {
            headers: { "mono-sec-key": monoSecretKey },
        });
        const { data } = response;
        console.log(data);
        if (data.id && data.id != '' && data.expiresAt && data.expiresAt != '') {
            return res.status(200).json({ status: 200, msg: 'Mono Session created successfully', data });
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, error: error.message });
    }
}
exports.createMonoSession = createMonoSession;
async function tokenSignin(req, res, next) {
    try {
        const { error } = utils_1.otpLoginSchema.validate(req.body, utils_1.options);
        if (error) {
            return res.status(400).json({ status: 400, error: error.details[0].message });
        }
        const { otp, sessionId } = req.body;
        const headers = {
            accept: 'application/json',
            'Content-Type': 'application/json',
            'x-session-id': sessionId,
            'mono-sec-key': monoSecretKey,
        };
        const BASE_API_URL = 'https://api.withmono.com';
        const response = await axios_1.default.post(`${BASE_API_URL}/v1/connect/commit`, {
            otp: otp,
        }, {
            headers: headers
        });
        const { data } = response;
        console.log(data);
        return res.status(200).json({ status: 200, msg: 'Mono token signin created successfully', data });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, error: error });
    }
}
exports.tokenSignin = tokenSignin;
