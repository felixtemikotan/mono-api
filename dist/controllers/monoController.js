"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateLinkedBank = exports.deleteLinkedBank = exports.monoDirectPay = exports.getLinkedBank = exports.monoSessionLoginCredential = void 0;
const uuid_1 = require("uuid");
const linkedBanks_1 = require("../models/linkedBanks");
const utils_1 = require("../util/utils");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const request_1 = __importDefault(require("request"));
const axios_1 = __importDefault(require("axios"));
const transactions_1 = require("../models/transactions");
const secret = process.env.JWT_SECRET;
const monoSecretKey = process.env.MONO_SECRET_KEY;
const monoAppId = process.env.MONO_APP_ID;
const monoBaseUrl = process.env.BASE_API_URL;
async function monoSessionLoginCredential(req, res, next) {
    try {
        const { error } = utils_1.monoSchema.validate(req.body, utils_1.options);
        if (error) {
            return res.status(400).json({ status: 400, error: error.details[0].message });
        }
        const { userId, bankId, password, username, icon, bankName, serviceType } = req.body;
        const id = (0, uuid_1.v4)();
        const tokenizedUsername = jsonwebtoken_1.default.sign({ username: username }, secret);
        const tokenizedPassword = jsonwebtoken_1.default.sign({ password: password }, secret);
        const auth_method = serviceType;
        const monoBody = {
            app: monoAppId,
            institution: bankId,
            auth_method: auth_method
        };
        const response = await axios_1.default.post(`${monoBaseUrl}/v1/connect/session`, monoBody, {
            headers: { "mono-sec-key": monoSecretKey },
        });
        if (!response.data.status) {
            return res.status(400).json({ status: 400, error: 'An error has occured while creating mono session', response });
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
            body: JSON.stringify({ username: username, password: password })
        };
        //console.log(detokenizedUsername.username, detokenizedPassword.password);
        (0, request_1.default)(option, async function (error, response) {
            if (error) {
                return res.status(400).json({ status: 400, error: error });
            }
            const result = await JSON.parse(response.body);
            if (!result.status || result.status === 400) {
                return res.status(400).json({ status: 400, message: result });
            }
            console.log(result);
            const { data } = result;
            //    const record = await ExchangeTokenInstance.update({ logintoken:result.data.code }, { where: { userId:userId } });
            //    const recordOut = await ExchangeTokenInstance.findOne({ where: { userId:userId } });
            const linkedDetails = await linkedBanks_1.LinkedBankInstance.create({
                id: id,
                bankId: bankId,
                userId: userId,
                icon: icon,
                bankName: bankName,
                username: tokenizedUsername,
                password: tokenizedPassword,
                serviceType: serviceType,
                wallet: 0.00,
            });
            const linkedBanks = await linkedBanks_1.LinkedBankInstance.findAll({ where: {} });
            return res.status(200).json({ status: 200, msg: 'Mono Login successful', linkedBanks, });
        });
    }
    catch (error) {
        return res.status(500).json({ status: 500, error: error.message });
    }
}
exports.monoSessionLoginCredential = monoSessionLoginCredential;
async function getLinkedBank(req, res) {
    try {
        const { userId } = req.params;
        console.log("userId :", userId);
        const linkedBanks = await linkedBanks_1.LinkedBankInstance.findAll({ where: { userId } });
        return res.status(200).json({ status: 200, msg: 'Bank Accounts found successfully', linkedBanks });
    }
    catch (error) {
        return res.status(500).json({ status: 500, error: error.message });
    }
}
exports.getLinkedBank = getLinkedBank;
async function monoDirectPay(req, res) {
    try {
        const { userId, amount, description, id } = req.body;
        const bankDetails = await linkedBanks_1.LinkedBankInstance.findOne({ where: { userId: userId, id: id } });
        if (!bankDetails) {
            return res.status(404).json({ status: 404, error: 'bank credentials not found' });
        }
        const { serviceType, username, password, bankId } = bankDetails;
        const detokenizedUsername = jsonwebtoken_1.default.verify(username, secret);
        const decryptedUsername = detokenizedUsername.username;
        const detokenizedPassword = jsonwebtoken_1.default.verify(password, secret);
        const decryptedPassword = detokenizedPassword.password;
        const auth_method = serviceType;
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
                institution: bankId
            })
        };
        (0, request_1.default)(option, async function (error, response, body) {
            const resultOut = await JSON.parse(response.body);
            if (resultOut.status !== 'successful') {
                return res.status(400).json({ status: 400, msg: 'An error has occured while getting account details', error });
            }
            const sessionID = resultOut.id;
            const options = {
                method: 'POST',
                url: `${monoBaseUrl}/v1/connect/login`,
                headers: {
                    accept: 'application/json',
                    'x-session-id': sessionID,
                    'mono-sec-key': monoSecretKey,
                    'content-type': 'application/json'
                },
                body: JSON.stringify({ username: decryptedUsername, password: decryptedPassword })
            };
            (0, request_1.default)(options, async function (error, response, body) {
                if (!error) {
                    const resultOut = await JSON.parse(response.body);
                    console.log(resultOut);
                    if (!resultOut.status || resultOut.status === 400) {
                        return res.status(400).json({ status: 400, msg: 'An error has occured while trying to connect to your bank. Please try again later', resultOut });
                    }
                    const loginCode = resultOut.data.code;
                    //const storeSessionCode = await DirectPayInstance.update({logintoken:loginCode},{ where: { userId:userId } });
                    //const storedDirectTable=await DirectPayInstance.findOne({where:{userId:userId}})
                    const reference = (0, uuid_1.v4)();
                    const option = {
                        method: 'POST',
                        url: `${monoBaseUrl}/v1/direct-pay/session`,
                        headers: {
                            accept: 'application/json',
                            'mono-sec-key': monoSecretKey,
                            'x-session-id': sessionID,
                            'content-type': 'application/json'
                        },
                        body: JSON.stringify({ type: 'onetime-debit', amount: amount * 100, description: description, reference: reference })
                    };
                    (0, request_1.default)(option, async function (error, response, body) {
                        //console.log(response);
                        const resultOut = JSON.parse(response.body);
                        console.log("resultOut ", resultOut);
                        if (!error) {
                            //const directPaySessionCode= await DirectPayInstance.update({exchangetoken:resultOut.code},{ where: { userId:userId } });
                            //const storedDirectTable=await DirectPayInstance.findOne({where:{userId:userId}})
                            const initialAmount = await linkedBanks_1.LinkedBankInstance.findOne({ where: { id: id } });
                            const { wallet } = initialAmount;
                            const balance = wallet + resultOut.data.session.amount;
                            const updateLinkedBank = await linkedBanks_1.LinkedBankInstance.update({ wallet: balance }, { where: { id: id } });
                            //const id = uuidv4();
                            const transactionDetails = await transactions_1.TransactionInstance.create({
                                id: resultOut.data.session.id,
                                userId: userId,
                                bankId: bankId,
                                sessionId: sessionID,
                                loginToken: loginCode,
                                exchangeToken: resultOut.code,
                                amount: resultOut.data.session.amount,
                                description: resultOut.data.session.description,
                                referrence: resultOut.data.session.reference,
                            });
                            // console.log("reached here");
                            return res.status(200).json({ status: 200, responseCode: resultOut.responseCode, msg: "credit transaction successful", transactionDetails });
                        }
                        return res.status(400).json({ status: 400, msg: 'An error has occured while getting account details', error });
                    });
                    //return res.status(200).json({ status: 200, msg: 'User details found successfully',resultOut});
                }
                else {
                    return res.status(400).json({ status: 400, msg: 'account not found', error });
                }
            });
        });
    }
    catch (err) {
        res.status(500).json({ status: 500, error: "Server error" });
    }
}
exports.monoDirectPay = monoDirectPay;
async function deleteLinkedBank(req, res) {
    try {
        const { id } = req.params;
        const linkedBanks = await linkedBanks_1.LinkedBankInstance.destroy({ where: { id } });
        return res.status(200).json({ status: 200, msg: 'Account deleted successfully' });
    }
    catch (error) {
        return res.status(500).json({ status: 500, error: error.message });
    }
}
exports.deleteLinkedBank = deleteLinkedBank;
async function updateLinkedBank(req, res) {
    try {
        const { id } = req.params;
        const linkedBanks = await linkedBanks_1.LinkedBankInstance.update({ wallet: 0.00 }, { where: { id: id } });
        return res.status(200).json({ status: 200, msg: 'Account updated successfully' });
    }
    catch (error) {
        return res.status(500).json({ status: 500, error: error.message });
    }
}
exports.updateLinkedBank = updateLinkedBank;
