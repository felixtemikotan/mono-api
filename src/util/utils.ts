import dotenv from 'dotenv';
import jwt  from "jsonwebtoken";
import Joi from "joi";

dotenv.config();

export const createUserSchema = Joi.object({
    fullname: Joi.string().required(),
    username: Joi.string().required(),
    email: Joi.string().email().required(),
    mobile: Joi.string().length(11).pattern(/^[0-9]+$/).required(),
    pin: Joi.string().required(),
})

export const directpaySessionSchema = Joi.object({
    amount: Joi.string().required(),
    description: Joi.string().required(),
});

export const updateUserSchema = Joi.object({
    firstname: Joi.string(),
    lastname: Joi.string(),
    email: Joi.string().email(),
    mobile: Joi.string().length(11).pattern(/^[0-9]+$/),
});

export const otpLoginSchema = Joi.object({
    otp: Joi.string().required(),
    sessionId: Joi.string().required(),
});

export const loginUserSchema = Joi.object({
    mobile: Joi.string().required(),
    pin: Joi.string().required()
});

export const monoLoginSchema= Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
    sessionId: Joi.string().required()
});

export const createMonoSessionSchema = Joi.object({
    institution: Joi.string().required(),
    auth_method: Joi.string().required(),
});

export const createBankAccountSchema = Joi.object({
    accountnumber: Joi.string().required().length(10).pattern(/^[0-9]+$/),
    accountname: Joi.string().required(),
    bankname: Joi.string().required(),
    accounttype: Joi.string().required(),
    banktransactiontype: Joi.string().required(),
    servicetype: Joi.string().required(),
    username: Joi.string().required(),
    password: Joi.string().required(),
    confirmPassword: Joi.ref('password')
}).with('password', 'confirmPassword');

export const confirmPaymentVerificationSchema = Joi.object({
    answer: Joi.string().required(),
    token: Joi.string().required(),
    bvn: Joi.string().required(),
    pin: Joi.string().required(),
});


export const createChargeSchema= Joi.object({
    token: Joi.string().required(),
    answer: Joi.string().required(),
    otp: Joi.string().required(),
});

export const captureChargeSchema= Joi.object({
    answer: Joi.string().required(),
    token: Joi.string().required(),
    pin: Joi.string().required(),
    bvn: Joi.string().required(),
});



export const updateBankAccountSchema = Joi.object({
    accountnumber: Joi.string().length(10).pattern(/^[0-9]+$/),
    accountname: Joi.string(),
    bankname: Joi.string(),
    accounttype: Joi.string(),
    banktransactiontype: Joi.string(),
    servicetype: Joi.string(),
    username: Joi.string(),
    password: Joi.string(),
    confirmPassword: Joi.ref('password')
}).with('password', 'confirmPassword');

export const getTransactionHistorySchema = Joi.object({
    duration: Joi.string().max(2).required(),
});

export const monoSessionLoginSchema = Joi.object({
    institution: Joi.string().required()
});
 
export const monoSchema = Joi.object({
    bankId: Joi.string().required(),
    userId: Joi.string().required(),
    icon: Joi.string().required(),
    bankName: Joi.string().required(),
    username: Joi.string().required(),
    password: Joi.string().required(),
    serviceType: Joi.string().required()
  
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