const dotenv = require('dotenv')

dotenv.config();

export const db_host = String(process.env.DB_HOST);

export const db_port = Number(process.env.DB_PORT);

export const db_name = String(process.env.DB_NAME);

export const db_user = String(process.env.DB_USER);

export const db_password = String(process.env.DB_PASSWORD);



// DB_NAME=mono_api

// DB_USER=postgres

// DB_PASSWORD=GskuvimR@1127