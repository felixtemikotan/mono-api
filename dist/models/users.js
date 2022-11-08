"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserInstance = void 0;
const sequelize_1 = require("sequelize");
const database_config_1 = __importDefault(require("../config/database.config"));
class UserInstance extends sequelize_1.Model {
}
exports.UserInstance = UserInstance;
UserInstance.init({
    id: {
        type: sequelize_1.DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    firstname: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    lastname: {
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
    homeaddress: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    residentialaddress: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    nin: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    bvn: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    city: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    state: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    country: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    zipcode: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    comment: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    accountnumber: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    phonenumber: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    bankname: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    bankcode: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    bankaccountnumber: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    accountofficer: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    branch: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
}, {
    sequelize: database_config_1.default,
    tableName: 'userTable'
});
//  UserInstance.hasMany(usersGroupInstance, { foreignKey: "userId", as: "groups" });
//  usersGroupInstance.belongsTo(UserInstance, { foreignKey: "userId", as: "user" });
