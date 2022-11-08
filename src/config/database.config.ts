import { Sequelize } from 'sequelize';
import {Client} from 'pg';
import { db_host, db_port, db_name, db_user, db_password } from './config';

 const db = new Sequelize({

  dialect: "postgres",

  host: db_host,

  port: db_port,

  database: db_name,

  username: db_user,

  password: db_password

});
export default db;

 
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



