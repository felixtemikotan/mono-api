import dotenv from "dotenv";
import express, { Request, Response, NextFunction } from "express";
import { v4 as uuidv4, validate } from "uuid";
import { UserInstance }  from "../models/users";
import { BankAccountInstance }  from "../models/bankaccount";
import {options,createUserSchema, loginUserSchema, createBankAccountSchema,updateUserSchema, updateBankAccountSchema, monoLoginSchema, createMonoSessionSchema, otpLoginSchema } from '../util/utils'
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { generateToken } from "../util/utils";
import { getAllBanksNG } from "./monoapi";
import axios from 'axios';
const secret = process.env.JWT_SECRET as string;
const monoSecretKey = process.env.MONO_SECRET_KEY as string;
const monoAppId = process.env.MONO_APP_ID as string;


export async function createUser(req: Request, res: Response, next: NextFunction) {
    try {
        const { error } = createUserSchema.validate(req.body, options);
        if (error) {
            return res.status(400).json({ status: 400, error: error.details[0].message });
        }
        const { firstname, lastname, username, email, phonenumber, password } = req.body;
        const duplicateEmail = await UserInstance.findOne({ where: { email } });
        if (duplicateEmail) {
            return res.status(409).json({ status: 409, error: 'Email already exist' });
        }
        const duplicateUsername = await UserInstance.findOne({ where: { username } });
        if (duplicateUsername) {
            return res.status(409).json({ status: 409, error: 'Username already exist' });
        }
        const duplicatePhonenumber = await UserInstance.findOne({ where: { phonenumber } });
        if (duplicatePhonenumber) {
            return res.status(409).json({ status: 409, error: 'Phonenumber already exist' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const id = uuidv4();
        const user = await UserInstance.create({
            id,
            firstname,
            lastname,
            username,
            email,
            phonenumber,
            password: hashedPassword,
        });
        return res.status(201).json({ status: 201, msg: 'User created successfully',user });
    } catch (error: any) {
        return res.status(500).json({ status: 500, error: error.message });
    }
}

export async function loginUser(req: Request, res: Response, next: NextFunction) {
    try {
        const { error } = loginUserSchema.validate(req.body, options);
        if (error) {
            return res.status(400).json({ status: 400, error: error.details[0].message });
        }
        const { email, password } = req.body;
        const user:any = await UserInstance.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ status: 400, error: 'Invalid email or password' });
        }
        const validPassword = bcrypt.compareSync(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ status: 400, error: 'Invalid email or password' });
        }
        const token = jwt.sign({ id: user.id }, secret as string);
        return res.status(200).json({ status: 200, msg: 'User logged in successfully', token, user });
    } catch (error: any) {
        return res.status(500).json({ status: 500, error: error.message });
    }
}

export async function updateUser(req:Request, res:Response, next:NextFunction){
    try {
        const { id } = req.params;
        const { error } = updateUserSchema.validate(req.body, options);
        if (error) {
            return res.status(400).json({ status: 400, error: error.details[0].message });
        }
        const { firstname, lastname, email, phonenumber } = req.body;
        const user = await UserInstance.findOne({ where: { id } });
        if (!user) {
            return res.status(404).json({ status: 404, error: 'User not found' });
        }
        const record=await UserInstance.update({ firstname, lastname, email, phonenumber }, { where: { id } });
        return res.status(200).json({ status: 200, msg: 'User updated successfully',record });
    } catch (error: any) {
        return res.status(500).json({ status: 500, error: error.message });
    }
}

export async function deleteUser(req:Request, res:Response, next:NextFunction){
    try {
        const { id } = req.params;
        const user = await UserInstance.findOne({ where: { id } });
        if (!user) {
            return res.status(404).json({ status: 404, error: 'User not found' });
        }
        await UserInstance.destroy({ where: { id } });
        return res.status(200).json({ status: 200, msg: 'User deleted successfully' });
    } catch (error: any) {
        return res.status(500).json({ status: 500, error: error.message });
    }
}

export async function getUser(req:Request, res:Response, next:NextFunction){
    try {
        const { id } = req.params;
        const user = await UserInstance.findOne({ where: { id },
            include: [{ model: BankAccountInstance, as: "bankaccounts" }], 
        });
        if (!user) {
            return res.status(404).json({ status: 404, error: 'User not found' });
        }
        return res.status(200).json({ status: 200, msg: 'User found successfully',user });
    } catch (error: any) {
        return res.status(500).json({ status: 500, error: error.message });
    }
}

export async function getAllUsers(req:Request, res:Response, next:NextFunction){
    try {
        const users = await UserInstance.findAll();
        return res.status(200).json({ status: 200, msg: 'Users found successfully',users });
    } catch (error: any) {
        return res.status(500).json({ status: 500, error: error.message });
    }
}


export async function createBankAccount(req: Request|any, res: Response, next: NextFunction) {
    try {
        const userId=req.user.id;
        const { error } = createBankAccountSchema.validate(req.body, options);
        if (error) {
            return res.status(400).json({ status: 400, error: error.details[0].message });
        }
        const { accountnumber, accountname, bankname, bankcode, accounttype,banktransactiontype } = req.body;
        const duplicateAccountnumber = await BankAccountInstance.findOne({ where: { accountnumber } });
        if (duplicateAccountnumber) {
            return res.status(409).json({ status: 409, error: 'Accountnumber already exist' });
        }
        const id = uuidv4();

        const tokenizedAccountnumber=jwt.sign({ accountnumber:accountnumber }, secret as string);
       
        let decryptedAccountNumber = jwt.verify(tokenizedAccountnumber, secret);
        

        const {data}:any = await getAllBanksNG();
        const banksData=data.map((bank:any)=>{
            let allBanksData:any={};
            allBanksData.bankId=bank._id;
            allBanksData.bankname=bank.name;
            allBanksData.type=bank.type;
            return allBanksData;
        });    
        

        const bankCode = banksData.filter((item: { bankname: string, type:string }) => {
            if(item.bankname.toLowerCase() == bankname.toLowerCase() && item.type.toLowerCase() == banktransactiontype.toLowerCase())
            return item;
        });
        
        if (bankCode.length == 0) {
            return res.status(404).json({ status: 404, msg: 'Bank not found', banksData });
        }
        let code = bankCode[0].bankId
        console.log(bankCode);
        const bankaccount = await BankAccountInstance.create({
            id:id,
            userId:userId,
            accountnumber:tokenizedAccountnumber,
            accountname:accountname,
            bankname:bankname,
            bankcode:code,
            accounttype:accounttype,
            banktransactiontype:banktransactiontype,
        });
        return res.status(201).json({ status: 201, msg: 'Bank Account created successfully', bankaccount });
    } catch (error: any) {
        return res.status(500).json({ status: 500, error: error.message });
    }
}

export async function updateBankAccount(req:Request, res:Response, next:NextFunction){
    try {
        const { id } = req.params;
        const { error } = updateBankAccountSchema.validate(req.body, options);
        if (error) {
            return res.status(400).json({ status: 400, error: error.details[0].message });
        }
        const { accountnumber, accountname, bankname, accounttype,banktransactiontype } = req.body;
        const bankaccount = await BankAccountInstance.findOne({ where: { id } });
        if (!bankaccount) {
            return res.status(404).json({ status: 404, error: 'Bank Account not found' });
        }
        const tokenizedAccountnumber=jwt.sign({ accountnumber:accountnumber }, secret as string);
        const {data}:any = await getAllBanksNG();
        const banksData=data.map((bank:any)=>{
            let allBanksData:any={};
            allBanksData.bankId=bank._id;
            allBanksData.bankname=bank.name;
            allBanksData.type=bank.type;
            return allBanksData;
        });    

        const bankCode = banksData.filter((item: { bankname: string }) => item.bankname.toLowerCase() == bankname.toLowerCase())
        if(bankCode.length == 0){
            return res.status(404).json({ status: 404, msg: 'Bank not found', banksData });
        }

        let code = bankCode[0].bankId

        const record=await BankAccountInstance.update({ accountnumber:tokenizedAccountnumber, accountname:accountname, 
            bankname:bankname, bankcode:code, accounttype:accounttype, banktransactiontype:banktransactiontype }, { where: { id } });
        return res.status(200).json({ status: 200, msg: 'Bank Account updated successfully',record });
    } catch (error: any) {
        return res.status(500).json({ status: 500, error: error.message });
    }
}

export async function deleteBankAccount(req:Request, res:Response, next:NextFunction){
    try {
        const { id } = req.params;
        const bankaccount = await BankAccountInstance.findOne({ where: { id } });
        if (!bankaccount) {
            return res.status(404).json({ status: 404, error: 'Bank Account not found' });
        }
        await BankAccountInstance.destroy({ where: { id } });
        return res.status(200).json({ status: 200, msg: 'Bank Account deleted successfully' });
    } catch (error: any) {
        return res.status(500).json({ status: 500, error: error.message });
    }
}
export async function getAllBankAccounts(req:Request, res:Response, next:NextFunction){
    try {
        const userId=req.params.userId;
        const bankaccounts = await BankAccountInstance.findAll({ where: { userId } });
        return res.status(200).json({ status: 200, msg: 'Bank Accounts found successfully',bankaccounts });
    } catch (error: any) {
        return res.status(500).json({ status: 500, error: error.message });
    }
}

export async function monoLogin(req:Request,res:Response,next:NextFunction){
    try{
        const { error } = monoLoginSchema.validate(req.body, options);
        if (error) {
            console.log("error",error);
            return res.status(400).json({ status: 400, error: error.details[0].message });
        }
        const { username, password, sessionId} = req.body;
         const BASE_API_URL = 'https://api.withmono.com'


        const bankUrl = `${BASE_API_URL}/v1/connect/login`;
        //const response = await axios.post(bankUrl);
console.log(1);
        const response = await axios.post(`${BASE_API_URL}/v1/connect/login`, {
            username: username,
            password: password
        },
        {
            headers: { 'mono-sec-key': monoSecretKey, 'x-session-id': sessionId, },
        }
        )
        console.log(2);
        if(response.status == 200){

        return res.status(200).json({ status: 200, msg: 'Mono Login successful',response });
        }
    }catch(error:any){
        console.log(error);
        return res.status(500).json({ status: 500, error: error.message });
    }
}

export async function createMonoSession(req:Request,res:Response,next:NextFunction){
    try{
        const { error } = createMonoSessionSchema.validate(req.body, options);
        if (error) {
            return res.status(400).json({ status: 400, error: error.details[0].message });
        }
        const { institution,auth_method } = req.body;
        const BASE_API_URL = 'https://api.withmono.com'
        const response:any = await axios.post(`${BASE_API_URL}/v1/connect/session`, {
            app: monoAppId,
            institution: institution,
            auth_method: auth_method
        },
        {
            headers: { 'mono-sec-key': monoSecretKey},
        }
        )
        const {data}:any = response;
        console.log(data);
        if(data.id && data.id != '' && data.expiresAt && data.expiresAt != ''){
            return res.status(200).json({ status: 200, msg: 'Mono Session created successfully',data });
        }
    }catch(error:any){
        console.log(error);
        return res.status(500).json({ status: 500, error: error.message });
    }
}

export async function tokenSignin(req:Request,res:Response,next:NextFunction){
    try{
        const { error } = otpLoginSchema.validate(req.body, options);
        if (error) {
            return res.status(400).json({ status: 400, error: error.details[0].message });
        }
        const { otp,sessionId } = req.body;
        const BASE_API_URL = 'https://api.withmono.com'
        const response:any = await axios.post(`${BASE_API_URL}/v1/connect/commit`, {
            otp: otp,
            
        },
        {
            headers: { 'mono-sec-key': monoSecretKey, 'x-session-id': sessionId, },
        }
        )
        const {data}:any = response;
        console.log(data);
            return res.status(200).json({ status: 200, msg: 'Mono token signin created successfully',data });
        
    }catch(error:any){
        console.log(error);
        return res.status(500).json({ status: 500, error: error.message });
    }
}