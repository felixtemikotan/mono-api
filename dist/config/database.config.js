"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
//import {Client} from 'pg';
const config_1 = require("./config");
const db = new sequelize_1.Sequelize({
    dialect: "postgres",
    host: config_1.db_host,
    port: config_1.db_port,
    database: config_1.db_name,
    username: config_1.db_user,
    password: config_1.db_password
});
exports.default = db;
// const connectDb = async () => {
//     try {
//         const client = new Client({
//             user: db_user,
//             host: db_host,
//             database: db_name,
//             password:db_password,
//             port: db_port,
//         })
//         await client.connect()
//         console.log('Connected to database')
//     } catch (error) {
//         console.log("This error occur:", error)
//     }
// }
// export default connectDb
