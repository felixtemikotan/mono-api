"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionInstance = void 0;
const sequelize_1 = require("sequelize");
const config_1 = __importDefault(require("../config/config"));
class TransactionInstance extends sequelize_1.Model {
}
exports.TransactionInstance = TransactionInstance;
TransactionInstance.init({
    id: {
        type: sequelize_1.DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    userId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    bankId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    sessionId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    loginToken: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    exchangeToken: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    amount: {
        type: sequelize_1.DataTypes.NUMBER,
        allowNull: true
    },
    description: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    referrence: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
}, {
    sequelize: config_1.default,
    tableName: 'transactions'
});
