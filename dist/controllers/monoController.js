"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.monoSessionLoginCredential = void 0;
const uuid_1 = require("uuid");
const bankaccount_1 = require("../models/bankaccount");
const linkedBanks_1 = require("../models/linkedBanks");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const request_1 = __importDefault(require("request"));
const axios_1 = __importDefault(require("axios"));
const exchangeToken_1 = require("../models/exchangeToken");
const secret = process.env.JWT_SECRET;
const monoSecretKey = process.env.MONO_SECRET_KEY;
const monoAppId = process.env.MONO_APP_ID;
const monoBaseUrl = process.env.BASE_API_URL;
/*
bankId: string;
  userId: string,
  icon: string;
  bankName: string;
  username: string;
  password: string;
  wallet: number,
*/
async function monoSessionLoginCredential(req, res, next) {
    try {
        // const { error } = monoSessionLoginSchema.validate(req.body, options);
        // if (error) {
        //     return res.status(400).json({ status: 400, error: error.details[0].message });
        // }
        const { userId, bankId, password, username, icon, bankName, servicetype } = req.body;
        //const userId=req.user.id;
        const userBankInfo = await bankaccount_1.BankAccountInstance.findOne({ where: { userId: userId, bankcode: bankId } });
        if (!userBankInfo) {
            return res.status(404).json({ status: 404, error: 'Bank Account not found' });
        }
        const id = (0, uuid_1.v4)();
        const tokenizedUsername = jsonwebtoken_1.default.sign({ username: username }, secret);
        const tokenizedPassword = jsonwebtoken_1.default.sign({ password: password }, secret);
        const detokenizedUsername = jsonwebtoken_1.default.verify(username, secret);
        const detokenizedPassword = jsonwebtoken_1.default.verify(password, secret);
        const auth_method = servicetype;
        // console.log(auth_method);
        //const BASE_API_URL = 'https://api.withmono.com'
        const response = await axios_1.default.post(`${monoBaseUrl}/v1/connect/session`, {
            app: monoAppId,
            institution: bankId,
            auth_method: auth_method
        }, {
            headers: { "mono-sec-key": monoSecretKey },
        });
        if (!response.data.status) {
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
            const record = await exchangeToken_1.ExchangeTokenInstance.update({ logintoken: result.data.code }, { where: { userId: userId } });
            const recordOut = await exchangeToken_1.ExchangeTokenInstance.findOne({ where: { userId: userId } });
            const linkedDetails = await linkedBanks_1.LinkedBankInstance.create({
                bankId: bankId,
                userId: userId,
                icon: icon,
                bankName: bankName,
                username: detokenizedUsername,
                password: detokenizedPassword,
                wallet: 0.00,
            });
            return res.status(200).json({ status: 200, msg: 'Mono Login successful', linkedDetails });
        });
    }
    catch (error) {
        return res.status(500).json({ status: 500, error: error.message });
    }
}
exports.monoSessionLoginCredential = monoSessionLoginCredential;
