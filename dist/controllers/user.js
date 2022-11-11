"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCharge = exports.directPaySession = exports.directPayLogin = exports.getClientsDebitInflow = exports.getClientsCreditInflow = exports.getClientEarnings = exports.getClinetInvestment = exports.getTransactionHistory = exports.getClientIdentity = exports.getMonoAccountStat = exports.getMonoAccountDetails = exports.exchangeToken = exports.getAllMonoBanks = exports.monoSessionLogin = exports.tokenSignin = exports.getAllBankAccounts = exports.deleteBankAccount = exports.updateBankAccount = exports.createBankAccount = exports.getAllUsers = exports.getUser = exports.deleteUser = exports.updateUser = exports.loginUser = exports.createUser = void 0;
const uuid_1 = require("uuid");
const users_1 = require("../models/users");
const bankaccount_1 = require("../models/bankaccount");
const utils_1 = require("../util/utils");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const request_1 = __importDefault(require("request"));
const monoapi_1 = require("./monoapi");
const axios_1 = __importDefault(require("axios"));
const exchangeToken_1 = require("../models/exchangeToken");
const directpay_1 = require("../models/directpay");
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
        const regID = id;
        const user = await users_1.UserInstance.create({
            id,
            firstname,
            lastname,
            username,
            email,
            phonenumber,
            password: hashedPassword,
        });
        if (!user) {
            return res.status(500).json({ status: 500, error: 'Internal server error' });
        }
        const exchangeTokenId = (0, uuid_1.v4)();
        const exchangeToken = await exchangeToken_1.ExchangeTokenInstance.create({
            id: exchangeTokenId,
            userId: regID,
            logintoken: '1234',
            exchangetoken: '1234',
        });
        const tokenData = await exchangeToken_1.ExchangeTokenInstance.findOne({ where: { userId: id } });
        const directPayId = (0, uuid_1.v4)();
        const directpay = await directpay_1.DirectPayInstance.create({
            id: directPayId,
            userId: regID,
            sessionId: '1234',
            logintoken: '1234',
            exchangetoken: '1234',
        });
        const directpayData = await directpay_1.DirectPayInstance.findOne({ where: { userId: regID } });
        return res.status(201).json({ status: 201, msg: 'User created successfully', user, tokenData, directpayData });
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
        const { id } = user;
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
        const { accountnumber, accountname, bankname, accounttype, banktransactiontype, servicetype, username, password } = req.body;
        const duplicateAccountnumber = await bankaccount_1.BankAccountInstance.findOne({ where: { accountnumber } });
        if (duplicateAccountnumber) {
            return res.status(409).json({ status: 409, error: 'Accountnumber already exist' });
        }
        const id = (0, uuid_1.v4)();
        const tokenizedUsername = jsonwebtoken_1.default.sign({ username: username }, secret);
        const tokenizedPassword = jsonwebtoken_1.default.sign({ password: password }, secret);
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
            accountnumber: accountnumber,
            accountname: accountname,
            bankname: bankname,
            bankcode: code,
            accounttype: accounttype,
            banktransactiontype: banktransactiontype,
            servicetype: servicetype,
            username: tokenizedUsername,
            password: tokenizedPassword,
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
        const { accountnumber, accountname, bankname, accounttype, banktransactiontype, servicetype, username, password } = req.body;
        const tokenizedUsername = jsonwebtoken_1.default.sign({ username: username }, secret);
        const tokenizedPassword = jsonwebtoken_1.default.sign({ password: password }, secret);
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
        const bankCode = banksData.filter((item) => {
            if (item.bankname.toLowerCase() == bankname.toLowerCase() && item.type.toLowerCase() == banktransactiontype.toLowerCase())
                return item;
        });
        if (bankCode.length == 0) {
            return res.status(404).json({ status: 404, msg: 'Bank not found', banksData });
        }
        let code = bankCode[0].bankId;
        const record = await bankaccount_1.BankAccountInstance.update({ accountnumber: accountnumber, accountname: accountname,
            bankname: bankname, bankcode: code, accounttype: accounttype, banktransactiontype: banktransactiontype,
            servicetype: servicetype, username: tokenizedUsername, password: tokenizedPassword }, { where: { id } });
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
async function monoSessionLogin(req, res, next) {
    try {
        const { error } = utils_1.monoSessionLoginSchema.validate(req.body, utils_1.options);
        if (error) {
            return res.status(400).json({ status: 400, error: error.details[0].message });
        }
        const { institution } = req.body;
        const userId = req.user.id;
        const userBankInfo = await bankaccount_1.BankAccountInstance.findOne({ where: { userId: userId, bankcode: institution } });
        if (!userBankInfo) {
            return res.status(404).json({ status: 404, error: 'Bank Account not found' });
        }
        const { servicetype, username, password } = userBankInfo;
        const detokenizedUsername = jsonwebtoken_1.default.verify(username, secret);
        const detokenizedPassword = jsonwebtoken_1.default.verify(password, secret);
        const auth_method = servicetype;
        console.log(auth_method);
        //const BASE_API_URL = 'https://api.withmono.com'
        const response = await axios_1.default.post(`${monoBaseUrl}/v1/connect/session`, {
            app: monoAppId,
            institution: institution,
            auth_method: auth_method
        }, {
            headers: { "mono-sec-key": monoSecretKey },
        });
        if (response.data.status !== 'successful') {
            return res.status(400).json({ status: 400, msg: 'An error has occured while creating mono session', response });
        }
        const { data } = response;
        const sessionId = data.id;
        console.log(sessionId);
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
            body: JSON.stringify({ username: detokenizedUsername.username, password: detokenizedPassword.password })
        };
        (0, request_1.default)(option, async function (error, response) {
            if (error) {
                return res.status(400).json({ status: 400, error: error });
            }
            const result = await JSON.parse(response.body);
            console.log(result.data);
            const record = await exchangeToken_1.ExchangeTokenInstance.update({ logintoken: result.data.code }, { where: { userId: userId } });
            const recordOut = await exchangeToken_1.ExchangeTokenInstance.findOne({ where: { userId: userId } });
            return res.status(200).json({ status: 200, msg: 'Mono Login successful', result, recordOut });
        });
    }
    catch (error) {
        return res.status(500).json({ status: 500, error: error.message });
    }
}
exports.monoSessionLogin = monoSessionLogin;
async function getAllMonoBanks(req, res, next) {
    try {
        const options = {
            method: 'GET',
            url: 'https://api.withmono.com/v1/institutions?scope=payments&country=ng',
            headers: { accept: 'application/json' }
        };
        (0, request_1.default)(options, async function (error, response, body) {
            const resultOut = await JSON.parse(response.body);
            const formattedOutput = resultOut.map((item) => {
                return {
                    bankId: item._id,
                    bankName: item.name,
                    serviceYype: item.type,
                };
            });
            const numberOfBanks = formattedOutput.length;
            console.log(formattedOutput);
            return res.status(200).json({ status: 200, msg: 'Mono Banks found successfully', numberOfBanks: numberOfBanks, formattedOutput });
        });
    }
    catch (error) {
        return res.status(500).json({ status: 500, error: error.message });
    }
}
exports.getAllMonoBanks = getAllMonoBanks;
async function exchangeToken(req, res, next) {
    try {
        const userId = req.user.id;
        const loginCode = await exchangeToken_1.ExchangeTokenInstance.findOne({ where: { userId } });
        const { logintoken } = loginCode;
        const options = {
            method: 'POST',
            url: 'https://api.withmono.com/account/auth',
            headers: {
                accept: 'application/json',
                'mono-sec-key': monoSecretKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code: logintoken })
        };
        (0, request_1.default)(options, async function (error, response, body) {
            if (!error) {
                const resultOut = await JSON.parse(response.body);
                console.log(resultOut);
                const record = await exchangeToken_1.ExchangeTokenInstance.update({ exchangetoken: resultOut.id }, { where: { userId: userId } });
                const recordOut = await exchangeToken_1.ExchangeTokenInstance.findOne({ where: { userId: userId } });
                return res.status(200).json({ status: 200, msg: 'Mono Banks found successfully', resultOut, recordOut });
            }
        });
    }
    catch (error) {
        return res.status(500).json({ status: 500, error: error.message });
    }
}
exports.exchangeToken = exchangeToken;
async function getMonoAccountDetails(req, res, next) {
    try {
        const userId = req.user.id;
        const SecretData = await exchangeToken_1.ExchangeTokenInstance.findOne({ where: { userId: userId } });
        if (!SecretData) {
            return res.status(404).json({ status: 404, error: 'Account not found' });
        }
        const { exchangetoken } = SecretData;
        console.log(exchangetoken);
        const options = {
            method: 'GET',
            url: `${monoBaseUrl}/accounts/${exchangetoken}`,
            headers: { accept: 'application/json', 'mono-sec-key': monoSecretKey }
        };
        (0, request_1.default)(options, async function (error, response, body) {
            if (!error) {
                const resultOut = await JSON.parse(response.body);
                console.log(resultOut);
                return res.status(200).json({ status: 200, msg: 'Mono Banks found successfully', resultOut });
            }
            return res.status(400).json({ status: 400, msg: 'An error has occured while getting mono account details', error });
        });
    }
    catch (error) {
        return res.status(500).json({ status: 500, error: error.message });
    }
}
exports.getMonoAccountDetails = getMonoAccountDetails;
async function getMonoAccountStat(req, res, next) {
    try {
        const userId = req.user.id;
        const SecretData = await exchangeToken_1.ExchangeTokenInstance.findOne({ where: { userId: userId } });
        if (!SecretData) {
            return res.status(404).json({ status: 404, error: 'Account not found' });
        }
        const { exchangetoken } = SecretData;
        const options = {
            method: 'GET',
            url: `${monoBaseUrl}/v1/accounts/${exchangetoken}/income`,
            headers: {
                accept: 'application/json',
                'mono-sec-key': monoSecretKey,
                'Content-Type': 'application/json'
            }
        };
        (0, request_1.default)(options, async function (error, response, body) {
            if (!error) {
                const resultOut = await JSON.parse(response.body);
                console.log(resultOut);
                return res.status(200).json({ status: 200, msg: 'Mono Banks found successfully', resultOut });
            }
            return res.status(400).json({ status: 400, msg: 'An error has occured while getting mono account details', error });
        });
    }
    catch (error) {
        return res.status(500).json({ status: 500, error: error.message });
    }
}
exports.getMonoAccountStat = getMonoAccountStat;
async function getClientIdentity(req, res, next) {
    try {
        const userId = req.user.id;
        const SecretData = await exchangeToken_1.ExchangeTokenInstance.findOne({ where: { userId: userId } });
        if (!SecretData) {
            return res.status(404).json({ status: 404, error: 'Account not found' });
        }
        const { exchangetoken } = SecretData;
        const options = {
            method: 'GET',
            url: `${monoBaseUrl}/accounts/${exchangetoken}/identity`,
            headers: { accept: 'application/json', 'mono-sec-key': 'live_sk_uueEcsoBUSfcSFekEkv6' }
        };
        (0, request_1.default)(options, async function (error, response, body) {
            if (!error) {
                const resultOut = await JSON.parse(response.body);
                console.log(resultOut);
                return res.status(200).json({ status: 200, msg: 'User details found successfully', resultOut });
            }
            return res.status(400).json({ status: 400, msg: 'An error has occured while getting account details', error });
        });
    }
    catch (error) {
        return res.status(500).json({ status: 500, error: error.message });
    }
}
exports.getClientIdentity = getClientIdentity;
async function getTransactionHistory(req, res, next) {
    try {
        const validated = utils_1.getTransactionHistorySchema.validate(req.body, utils_1.options);
        if (validated.error) {
            return res.status(400).json({ status: 400, error: validated.error.details[0].message });
        }
        const { duration } = req.body;
        const userId = req.user.id;
        const SecretData = await exchangeToken_1.ExchangeTokenInstance.findOne({ where: { userId: userId } });
        if (!SecretData) {
            return res.status(404).json({ status: 404, error: 'Account not found' });
        }
        const { exchangetoken } = SecretData;
        const option = {
            method: 'GET',
            url: `${monoBaseUrl}/accounts/${exchangetoken}/statement?period=last${duration}months&output=Json`,
            headers: { accept: 'application/json', 'mono-sec-key': 'live_sk_uueEcsoBUSfcSFekEkv6' }
        };
        (0, request_1.default)(option, async function (error, response, body) {
            if (!error) {
                const resultOut = await JSON.parse(response.body);
                console.log(resultOut);
                return res.status(200).json({ status: 200, msg: 'User details found successfully', resultOut });
            }
            return res.status(400).json({ status: 400, msg: 'An error has occured while getting account details', error });
        });
    }
    catch (error) {
        return res.status(500).json({ status: 500, error: error.message });
    }
}
exports.getTransactionHistory = getTransactionHistory;
async function getClinetInvestment(req, res, next) {
    try {
        const userId = req.user.id;
        const SecretData = await exchangeToken_1.ExchangeTokenInstance.findOne({ where: { userId: userId } });
        if (!SecretData) {
            return res.status(404).json({ status: 404, error: 'Account not found' });
        }
        const { exchangetoken } = SecretData;
        const options = {
            method: 'GET',
            url: `${monoBaseUrl}/accounts/${exchangetoken}/assets`,
            headers: { accept: 'application/json', 'mono-sec-key': monoSecretKey }
        };
        (0, request_1.default)(options, async function (error, response, body) {
            if (!error) {
                const resultOut = await JSON.parse(response.body);
                console.log(resultOut);
                return res.status(200).json({ status: 200, msg: 'User details found successfully', resultOut });
            }
            return res.status(400).json({ status: 400, msg: 'An error has occured while getting account details', error });
        });
    }
    catch (error) {
        return res.status(500).json({ status: 500, error: error.message });
    }
}
exports.getClinetInvestment = getClinetInvestment;
async function getClientEarnings(req, res, next) {
    try {
        const userId = req.user.id;
        const SecretData = await exchangeToken_1.ExchangeTokenInstance.findOne({ where: { userId: userId } });
        if (!SecretData) {
            return res.status(404).json({ status: 404, error: 'Account not found' });
        }
        const { exchangetoken } = SecretData;
        const options = {
            method: 'GET',
            url: `${monoBaseUrl}/accounts/${exchangetoken}/earnings`,
            headers: { accept: 'application/json', 'mono-sec-key': monoSecretKey }
        };
        (0, request_1.default)(options, async function (error, response, body) {
            if (!error) {
                const resultOut = await JSON.parse(response.body);
                console.log(resultOut);
                return res.status(200).json({ status: 200, msg: 'User details found successfully', resultOut });
            }
            return res.status(400).json({ status: 400, msg: 'An error has occured while getting account details', error });
        });
    }
    catch (error) {
        return res.status(500).json({ status: 500, error: error.message });
    }
}
exports.getClientEarnings = getClientEarnings;
//636bccb8821b514843ab899c
//live_sk_uueEcsoBUSfcSFekEkv6
async function getClientsCreditInflow(req, res, next) {
    try {
        const userId = req.user.id;
        const SecretData = await exchangeToken_1.ExchangeTokenInstance.findOne({ where: { userId: userId } });
        if (!SecretData) {
            return res.status(404).json({ status: 404, error: 'Account not found' });
        }
        const { exchangetoken } = SecretData;
        const options = {
            method: 'GET',
            url: `${monoBaseUrl}/accounts/${exchangetoken}/credits`,
            headers: { accept: 'application/json', 'mono-sec-key': monoSecretKey }
        };
        (0, request_1.default)(options, async function (error, response, body) {
            if (!error) {
                const resultOut = await JSON.parse(response.body);
                console.log(resultOut);
                return res.status(200).json({ status: 200, msg: 'User details found successfully', resultOut });
            }
            return res.status(400).json({ status: 400, msg: 'An error has occured while getting account details', error });
        });
    }
    catch (error) {
        return res.status(500).json({ status: 500, error: error.message });
    }
}
exports.getClientsCreditInflow = getClientsCreditInflow;
async function getClientsDebitInflow(req, res, next) {
    try {
        const userId = req.user.id;
        const SecretData = await exchangeToken_1.ExchangeTokenInstance.findOne({ where: { userId: userId } });
        if (!SecretData) {
            return res.status(404).json({ status: 404, error: 'Account not found' });
        }
        const { exchangetoken } = SecretData;
        const request = require('request');
        const options = {
            method: 'GET',
            url: `${monoBaseUrl}/accounts/${exchangetoken}/debits?api_key=${monoAppId}`,
            headers: { accept: 'application/json', 'mono-sec-key': monoSecretKey }
        };
        request(options, async function (error, response, body) {
            if (!error) {
                const resultOut = await JSON.parse(response.body);
                console.log(resultOut);
                return res.status(200).json({ status: 200, msg: 'User details found successfully', resultOut });
            }
            return res.status(400).json({ status: 400, msg: 'An error has occured while getting account details', error });
        });
    }
    catch (error) {
        return res.status(500).json({ status: 500, error: error.message });
    }
}
exports.getClientsDebitInflow = getClientsDebitInflow;
async function directPayLogin(req, res, next) {
    try {
        const { error } = utils_1.monoSessionLoginSchema.validate(req.body, utils_1.options);
        if (error) {
            return res.status(400).json({ status: 400, error: error.details[0].message });
        }
        const { institution } = req.body;
        const userId = req.user.id;
        const tokenData = await exchangeToken_1.ExchangeTokenInstance.findOne({ where: { userId: userId } });
        const userBankInfo = await bankaccount_1.BankAccountInstance.findOne({ where: { userId: userId, bankcode: institution } });
        if (!userBankInfo) {
            return res.status(404).json({ status: 404, error: 'Bank Account not found' });
        }
        const { servicetype, username, password } = userBankInfo;
        const detokenizedUsername = jsonwebtoken_1.default.verify(username, secret);
        const decryptedUsername = detokenizedUsername.username;
        const detokenizedPassword = jsonwebtoken_1.default.verify(password, secret);
        const decryptedPassword = detokenizedPassword.password;
        const auth_method = servicetype;
        const option = {
            method: 'POST',
            url: `${monoBaseUrl}/v1/connect/session`,
            headers: {
                accept: 'application/json',
                'mono-sec-key': monoSecretKey,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                app: monoAppId,
                auth_method: auth_method,
                institution: institution
            }),
        };
        (0, request_1.default)(option, async function (error, response, body) {
            const resultOut = await JSON.parse(response.body);
            if (resultOut.status !== 'successful') {
                return res.status(400).json({ status: 400, msg: 'An error has occured while getting account details', error });
            }
            const sessionID = resultOut.id;
            const storeSession = await directpay_1.DirectPayInstance.update({ sessionId: sessionID }, { where: { userId: userId } });
            const options = {
                method: 'POST',
                url: `${monoBaseUrl}/v1/connect/login`,
                headers: {
                    accept: 'application/json',
                    'x-session-id': sessionID,
                    'mono-sec-key': monoSecretKey,
                    'content-type': 'application/json'
                },
                body: JSON.stringify({ username: decryptedUsername, password: decryptedPassword }),
            };
            (0, request_1.default)(options, async function (error, response, body) {
                if (!error) {
                    const resultOut = await JSON.parse(response.body);
                    const loginCode = resultOut.data.code;
                    const storeSessionCode = await directpay_1.DirectPayInstance.update({ logintoken: loginCode }, { where: { userId: userId } });
                    const storedDirectTable = await directpay_1.DirectPayInstance.findOne({ where: { userId: userId } });
                    return res.status(200).json({ status: 200, msg: 'User details found successfully', resultOut, storedDirectTable });
                }
                return res.status(400).json({ status: 400, msg: 'An error has occured while getting account details', error });
            });
        });
    }
    catch (error) {
        return res.status(500).json({ status: 500, error: error.message });
    }
}
exports.directPayLogin = directPayLogin;
async function directPaySession(req, res, next) {
    try {
        const userId = req.user.id;
        const validateData = utils_1.directpaySessionSchema.validate(req.body, utils_1.options);
        if (validateData.error) {
            return res.status(400).json({ status: 400, error: validateData.error.details[0].message });
        }
        const { description, amount } = req.body;
        const directPaySecret = await directpay_1.DirectPayInstance.findOne({ where: { userId: userId } });
        if (!directPaySecret) {
            return res.status(404).json({ status: 404, error: 'Direct Pay not found' });
        }
        const { sessionId } = directPaySecret;
        const reference = (0, uuid_1.v4)();
        const option = {
            method: 'POST',
            url: `${monoBaseUrl}/v1/direct-pay/session`,
            headers: {
                accept: 'application/json',
                'mono-sec-key': monoSecretKey,
                'x-session-id': sessionId,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                type: 'onetime-debit',
                amount: amount,
                description: description,
                reference: reference
            }),
        };
        (0, request_1.default)(option, async function (error, response, body) {
            if (!error) {
                const resultOut = await JSON.parse(response.body);
                const directPaySessionCode = await directpay_1.DirectPayInstance.update({ exchangetoken: resultOut.code }, { where: { userId: userId } });
                const storedDirectTable = await directpay_1.DirectPayInstance.findOne({ where: { userId: userId } });
                return res.status(200).json({ status: 200, msg: 'User details found successfully', resultOut, storedDirectTable });
            }
            return res.status(400).json({ status: 400, msg: 'An error has occured while getting account details', error });
        });
    }
    catch (error) {
        return res.status(500).json({ status: 500, error: error.message });
    }
}
exports.directPaySession = directPaySession;
async function createCharge(req, res, next) {
    try {
        const userId = req.user.id;
        const validateData = utils_1.createChargeSchema.validate(req.body, utils_1.options);
        if (validateData.error) {
            return res.status(400).json({ status: 400, error: validateData.error.details[0].message });
        }
        const { token } = req.body;
        const directPaySecret = await directpay_1.DirectPayInstance.findOne({ where: { userId: userId } });
        if (!directPaySecret) {
            return res.status(404).json({ status: 404, error: 'Direct Pay not found' });
        }
        const { sessionId } = directPaySecret;
        const option = {
            method: 'POST',
            url: `${monoBaseUrl}/v1/direct-pay/charge`,
            headers: {
                accept: 'application/json',
                'mono-sec-key': monoSecretKey,
                'x-session-id': sessionId,
                'content-type': 'application/json'
            },
            body: JSON.stringify({ token: token }),
        };
        (0, request_1.default)(option, function (error, response, body) {
            if (!error) {
                const resultOut = JSON.parse(response.body);
                return res.status(200).json({ status: 200, msg: 'User details found successfully', resultOut });
            }
            return res.status(400).json({ status: 400, msg: 'An error has occured while getting account details', error });
        });
    }
    catch (error) {
        return res.status(500).json({ status: 500, error: error.message });
    }
}
exports.createCharge = createCharge;
