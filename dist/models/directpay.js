"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DirectPayInstance = void 0;
const sequelize_1 = require("sequelize");
const config_1 = __importDefault(require("../config/config"));
class DirectPayInstance extends sequelize_1.Model {
}
exports.DirectPayInstance = DirectPayInstance;
DirectPayInstance.init({
    id: {
        type: sequelize_1.DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    userId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    sessionId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    logintoken: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    exchangetoken: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    }
}, {
    sequelize: config_1.default,
    tableName: 'directPayTable'
});
