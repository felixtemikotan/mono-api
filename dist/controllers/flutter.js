"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllBanksNG = void 0;
const axios_1 = __importDefault(require("axios"));
const BASE_API_URL = 'https://api.withmono.com';
const bankUrl = `${BASE_API_URL}/v1/institutions`;
// const options:any = {
//     'method': 'GET',
//     'url': '{{BASE_API_URL}}/v1/institutions',
//     'headers': {
//       'Authorization': 'Bearer FLWSECK_TEST-SANDBOXDEMOKEY-X'
//     }
//   };
const getAllBanksNG = async () => {
    try {
        const response = await axios_1.default.get(bankUrl);
        return response;
    }
    catch (error) {
        return (error);
    }
};
exports.getAllBanksNG = getAllBanksNG;
