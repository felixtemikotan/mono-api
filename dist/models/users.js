"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserInstance = void 0;
const sequelize_1 = require("sequelize");
const config_1 = __importDefault(require("../config/config"));
const bankaccount_1 = require("./bankaccount");
class UserInstance extends sequelize_1.Model {
}
exports.UserInstance = UserInstance;
UserInstance.init({
    id: {
        type: sequelize_1.DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    fullname: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    username: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    mobile: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    pin: {
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
    tableName: 'userTable'
});
UserInstance.hasMany(bankaccount_1.BankAccountInstance, { foreignKey: "userId", as: "bankaccounts" });
bankaccount_1.BankAccountInstance.belongsTo(UserInstance, { foreignKey: "userId", as: "user" });
