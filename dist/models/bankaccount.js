"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BankAccountInstance = void 0;
const sequelize_1 = require("sequelize");
const database_config_1 = __importDefault(require("../config/database.config"));
class BankAccountInstance extends sequelize_1.Model {
}
exports.BankAccountInstance = BankAccountInstance;
BankAccountInstance.init({
    id: {
        type: sequelize_1.DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    userId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    accountnumber: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    accountname: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    bankname: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    bankcode: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    accounttype: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    banktransactiontype: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    username: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    }
}, {
    sequelize: database_config_1.default,
    tableName: 'bankaccountTable'
});
