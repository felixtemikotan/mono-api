import dotenv from 'dotenv';
import jwt  from "jsonwebtoken";
import Joi from "joi";

dotenv.config();

export const createUserSchema = Joi.object({
    firstname: Joi.string().required(),
    lastname: Joi.string().required(),
    username: Joi.string().required(),
    email: Joi.string().email().required(),
    phonenumber: Joi.string().length(11).pattern(/^[0-9]+$/).required(),
    password: Joi.string().required(),
    confirmPassword: Joi.ref('password')
}).with('password', 'confirmPassword');

export const updateUserSchema = Joi.object({
    firstname: Joi.string(),
    lastname: Joi.string(),
    email: Joi.string().email(),
    phonenumber: Joi.string().length(11).pattern(/^[0-9]+$/),
})

export const loginUserSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

export const createBankAccountSchema = Joi.object({
    accountnumber: Joi.string().required().length(10).pattern(/^[0-9]+$/),
    accountname: Joi.string().required(),
    bankname: Joi.string().required(),
    accounttype: Joi.string().required()
});

export const updateBankAccountSchema = Joi.object({
    accountnumber: Joi.string().length(10).pattern(/^[0-9]+$/),
    accountname: Joi.string(),
    bankname: Joi.string(),
    accounttype: Joi.string()
})

export const generateToken=(user:{[key:string]:unknown}):unknown=>{
    const pass = process.env.JWT_SECRET as string
     return jwt.sign(user,pass, {expiresIn:'7d'})
};

export const options = {
    abortEarly: false,
    errors: {
      wrap: {
        label: ''
      }
    }
  };