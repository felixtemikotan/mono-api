"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllBankAccounts = exports.deleteBankAccount = exports.updateBankAccount = exports.createBankAccount = exports.getAllUsers = exports.getUser = exports.deleteUser = exports.updateUser = exports.loginUser = exports.createUser = void 0;
const uuid_1 = require("uuid");
const users_1 = require("../models/users");
const bankaccount_1 = require("../models/bankaccount");
const utils_1 = require("../util/utils");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const flutter_1 = require("./flutter");
const secret = process.env.JWT_SECRET;
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
        const { accountnumber, accountname, bankname, bankcode, accounttype } = req.body;
        const duplicateAccountnumber = await bankaccount_1.BankAccountInstance.findOne({ where: { accountnumber } });
        if (duplicateAccountnumber) {
            return res.status(409).json({ status: 409, error: 'Accountnumber already exist' });
        }
        const id = (0, uuid_1.v4)();
        let { data } = await (0, flutter_1.getAllBanksNG)();
        const bankCode = data.filter((item) => item.name.toLowerCase() == bankname.toLowerCase());
        if (bankCode.length == 0) {
            return res.status(404).json({ status: 404, msg: 'Bank not found', data });
        }
        let code = bankCode[0].code;
        const bankaccount = await bankaccount_1.BankAccountInstance.create({
            id: id,
            userId: userId,
            accountnumber: accountnumber,
            accountname: accountname,
            bankname: bankname,
            bankcode: code,
            accounttype: accounttype,
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
        const { accountnumber, accountname, bankname, bankcode, accounttype } = req.body;
        const bankaccount = await bankaccount_1.BankAccountInstance.findOne({ where: { id } });
        if (!bankaccount) {
            return res.status(404).json({ status: 404, error: 'Bank Account not found' });
        }
        let { data } = await (0, flutter_1.getAllBanksNG)();
        const bankCode = data.filter((item) => item.name.toLowerCase() == bankname.toLowerCase());
        let code = bankCode[0].code;
        const record = await bankaccount_1.BankAccountInstance.update({ accountnumber: accountnumber, accountname: accountname,
            bankname: bankname, bankcode: code, accounttype: accounttype }, { where: { id } });
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
