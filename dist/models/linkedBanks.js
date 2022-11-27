"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkedBankInstance = void 0;
const sequelize_1 = require("sequelize");
const config_1 = __importDefault(require("../config/config"));
class LinkedBankInstance extends sequelize_1.Model {
}
exports.LinkedBankInstance = LinkedBankInstance;
LinkedBankInstance.init({
    bankId: {
        type: sequelize_1.DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    userId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    username: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    icon: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    bankName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    wallet: {
        type: sequelize_1.DataTypes.FLOAT,
        defaultValue: 0.00,
        allowNull: false
    }
}, {
    sequelize: config_1.default,
    tableName: 'linkedBanksTable'
});
