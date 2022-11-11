import dotenv from "dotenv";
import express, { Request, Response, NextFunction } from "express";
import { v4 as uuidv4, validate } from "uuid";
import { UserInstance }  from "../models/users";
import { BankAccountInstance }  from "../models/bankaccount";
import {options,createUserSchema, loginUserSchema, createBankAccountSchema,updateUserSchema,monoSessionLoginSchema,
    updateBankAccountSchema, monoLoginSchema, createMonoSessionSchema, otpLoginSchema, getTransactionHistorySchema, directpaySessionSchema, createChargeSchema } from '../util/utils'
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import request from 'request';
import { generateToken } from "../util/utils";
import { getAllBanksNG } from "./monoapi";
import axios from 'axios';
import { ExchangeTokenInstance } from "../models/exchangeToken";
import { UUID } from "sequelize";
import { DirectPayInstance } from "../models/directpay";
const secret = process.env.JWT_SECRET as string;
const monoSecretKey = process.env.MONO_SECRET_KEY as string;
const monoAppId = process.env.MONO_APP_ID as string;
const monoBaseUrl = process.env.BASE_API_URL as string; 


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
        const regID=id;

        const user = await UserInstance.create({
            id,
            firstname,
            lastname,
            username,
            email,
            phonenumber,
            password: hashedPassword,
        });
        if(!user){
            return res.status(500).json({ status: 500, error: 'Internal server error' });
        }
        const exchangeTokenId=uuidv4();
        const exchangeToken = await ExchangeTokenInstance.create({
            id:exchangeTokenId,
            userId:regID,
            logintoken:'1234',
            exchangetoken:'1234',

        })
        const tokenData=await ExchangeTokenInstance.findOne({where:{userId:id}})
       
        const directPayId=uuidv4();
        const directpay=await DirectPayInstance.create({
            id:directPayId,
            userId:regID,
            sessionId:'1234',
            logintoken:'1234',
            exchangetoken:'1234',
        })

        const directpayData=await DirectPayInstance.findOne({where:{userId:regID}})
       
        return res.status(201).json({ status: 201, msg: 'User created successfully',user,tokenData,directpayData });
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
        const{id}=user;
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
        const { accountnumber, accountname, bankname, accounttype,banktransactiontype,servicetype,username,password } = req.body;
        const duplicateAccountnumber = await BankAccountInstance.findOne({ where: { accountnumber } });
        if (duplicateAccountnumber) {
            return res.status(409).json({ status: 409, error: 'Accountnumber already exist' });
        }
        const id = uuidv4();

        const tokenizedUsername=jwt.sign({ username:username }, secret as string);
        const tokenizedPassword=jwt.sign({ password:password }, secret as string);
        
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
            accountnumber:accountnumber,
            accountname:accountname,
            bankname:bankname,
            bankcode:code,
            accounttype:accounttype,
            banktransactiontype:banktransactiontype,
            servicetype:servicetype,
            username:tokenizedUsername,
            password:tokenizedPassword,
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
        const { accountnumber, accountname, bankname, accounttype,banktransactiontype,servicetype,username,password } = req.body;
        const tokenizedUsername=jwt.sign({ username:username }, secret as string);
        const tokenizedPassword=jwt.sign({ password:password }, secret as string);
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

        const bankCode = banksData.filter((item: { bankname: string, type:string }) => {
            if(item.bankname.toLowerCase() == bankname.toLowerCase() && item.type.toLowerCase() == banktransactiontype.toLowerCase())
            return item;
        });
        if(bankCode.length == 0){
            return res.status(404).json({ status: 404, msg: 'Bank not found', banksData });
        }

        let code = bankCode[0].bankId

        const record=await BankAccountInstance.update({ accountnumber:accountnumber, accountname:accountname, 
            bankname:bankname, bankcode:code, accounttype:accounttype, banktransactiontype:banktransactiontype,
            servicetype:servicetype,username:tokenizedUsername,password:tokenizedPassword }, { where: { id } });
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

export async function tokenSignin(req:Request,res:Response,next:NextFunction){
    try{
        const { error } = otpLoginSchema.validate(req.body, options);
        if (error) {
            return res.status(400).json({ status: 400, error: error.details[0].message });
        }
        const { otp,sessionId } = req.body;
        const headers={
            accept: 'application/json',
            'Content-Type': 'application/json',
            'x-session-id': sessionId,
            'mono-sec-key': monoSecretKey,
        }
        const BASE_API_URL = 'https://api.withmono.com'
        const response:any = await axios.post(`${BASE_API_URL}/v1/connect/commit`, {
            otp: otp,
            
        },
        {
            headers: headers
        })
        const {data}:any = response;
        console.log(data);
            return res.status(200).json({ status: 200, msg: 'Mono token signin created successfully',data });
        
    }catch(error:any){
        console.log(error);
        return res.status(500).json({ status: 500, error: error });
    }
}

export async function monoSessionLogin(req:Request|any,res:Response,next:NextFunction){
    try{
        const { error } = monoSessionLoginSchema.validate(req.body, options);
        if (error) {
            return res.status(400).json({ status: 400, error: error.details[0].message });
        }
        const { institution } = req.body;
        const userId=req.user.id;
        const userBankInfo:any = await BankAccountInstance.findOne({ where: { userId:userId, bankcode:institution } });
        if (!userBankInfo) {
            return res.status(404).json({ status: 404, error: 'Bank Account not found' });
        }
        const {servicetype,username,password}=userBankInfo;
        const detokenizedUsername:any=jwt.verify(username, secret as string);
        const detokenizedPassword:any=jwt.verify(password, secret as string);
        const auth_method = servicetype;
        console.log(auth_method);

        //const BASE_API_URL = 'https://api.withmono.com'
        const response:any = await axios.post(`${monoBaseUrl}/v1/connect/session`, {
            app: monoAppId,
            institution: institution,
            auth_method: auth_method
        },
        {
            headers: { "mono-sec-key": monoSecretKey},
        }
        )
       
        if(response.data.status !== 'successful'){
            return res.status(400).json({ status: 400, msg: 'An error has occured while creating mono session',response });
        }
        const {data}:any = response;
        const sessionId = data.id;
        console.log(sessionId);

        const monoUrl = `${monoBaseUrl}/v1/connect/login`;
        const option = {
            'method': 'POST',
            'url':monoUrl,
            'headers': {
    
                Accept: 'application/json',
                'mono-sec-key':monoSecretKey,
                'x-session-id': sessionId,
                'Content-Type': 'application/json'  
            },
            body: JSON.stringify({username: detokenizedUsername.username, password: detokenizedPassword.password})
          };
         
          request(option, async function (error, response) { 
            if (error) {
                return res.status(400).json({ status: 400, error: error});  
            }
            const result:any = await JSON.parse(response.body);
           console.log(result.data);
           const record=await ExchangeTokenInstance.update({ logintoken:result.data.code }, { where: { userId:userId } });
           const recordOut=await ExchangeTokenInstance.findOne({ where: { userId:userId } });
          
              return res.status(200).json({ status: 200, msg: 'Mono Login successful',result,recordOut });
          });
       
        

    }catch(error:any){
        return res.status(500).json({ status: 500, error: error.message });
    }
}

export async function getAllMonoBanks(req:Request,res:Response,next:NextFunction){
    try{

        const options = {
        method: 'GET',
        url: 'https://api.withmono.com/v1/institutions?scope=payments&country=ng',
        headers: {accept: 'application/json'}
        };

        request(options, async function (error: any, response:Response|any, body: any) {

        const resultOut= await JSON.parse(response.body);
        const formattedOutput=resultOut.map((item:any)=>{
            return {
                bankId:item._id,
                bankName:item.name,
                serviceYype:item.type,
            }
        });
        const numberOfBanks=formattedOutput.length;
        console.log(formattedOutput);
        return res.status(200).json({ status: 200, msg: 'Mono Banks found successfully',numberOfBanks:numberOfBanks, formattedOutput});

        });

    }catch(error:any){
        return res.status(500).json({ status: 500, error: error.message });
    }
}

export async function exchangeToken(req:Request|any,res:Response,next:NextFunction){
    try{
            const userId=req.user.id;
            const loginCode:any= await ExchangeTokenInstance.findOne({ where: { userId } });
            const {logintoken}=loginCode;
           
            const options = {
            method: 'POST',
            url: 'https://api.withmono.com/account/auth',
            headers: {
                accept: 'application/json',
                'mono-sec-key': monoSecretKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({code: logintoken})
            };

            request(options, async function (error:any, response:any, body:any) {
            if(!error){
            const resultOut= await JSON.parse(response.body);
            console.log(resultOut);
            const record=await ExchangeTokenInstance.update({ exchangetoken:resultOut.id }, { where: { userId:userId } });
            const recordOut=await ExchangeTokenInstance.findOne({ where: { userId:userId } });
            return res.status(200).json({ status: 200, msg: 'Mono Banks found successfully',resultOut,recordOut});
            }
            });
    }catch(error:any){
        return res.status(500).json({ status: 500, error: error.message });
    }
}

export async function getMonoAccountDetails(req:Request|any, res:Response, next:NextFunction){
    try{
        const userId=req.user.id;
        const SecretData:any=await ExchangeTokenInstance.findOne({ where: { userId:userId } });
        if (!SecretData) {
            return res.status(404).json({ status: 404, error: 'Account not found' });
        }
        const {exchangetoken}=SecretData;
        console.log(exchangetoken);

        const options = {
        method: 'GET',
        url: `${monoBaseUrl}/accounts/${exchangetoken}`,
        headers: {accept: 'application/json', 'mono-sec-key': monoSecretKey}
        };

        request(options, async function (error:any, response:Response|any, body:any) {
        if(!error){ 
            const resultOut= await JSON.parse(response.body);
            console.log(resultOut);
            return res.status(200).json({ status: 200, msg: 'Mono Banks found successfully',resultOut});
        }

        return res.status(400).json({ status: 400, msg: 'An error has occured while getting mono account details',error});
     
        });
    }catch(error:any){
        return res.status(500).json({ status: 500, error: error.message });
    }
}

export async function getMonoAccountStat(req:Request|any, res:Response, next:NextFunction){
try{
    const userId=req.user.id;
    const SecretData:any = await ExchangeTokenInstance.findOne({ where: { userId:userId } });
    if (!SecretData) {
        return res.status(404).json({ status: 404, error: 'Account not found' });
    }
    const {exchangetoken}=SecretData;

const options = {
  method: 'GET',
  url: `${monoBaseUrl}/v1/accounts/${exchangetoken}/income`,
  headers: {
    accept: 'application/json',
    'mono-sec-key': monoSecretKey,
    'Content-Type': 'application/json'
  }
};

request(options, async function (error, response, body) {
   if(!error){
    const resultOut= await JSON.parse(response.body);
    console.log(resultOut);
    return res.status(200).json({ status: 200, msg: 'Mono Banks found successfully',resultOut});
    }
    return res.status(400).json({ status: 400, msg: 'An error has occured while getting mono account details',error});
});

}catch(error:any){
    return res.status(500).json({ status: 500, error: error.message });
}
}

export async function getClientIdentity(req:Request|any,res:Response|any, next:NextFunction){
    try{
        const userId=req.user.id;
        const SecretData:any=await ExchangeTokenInstance.findOne({ where: { userId:userId } });
        if (!SecretData) {
            return res.status(404).json({ status: 404, error: 'Account not found' });
        }
        const {exchangetoken}=SecretData;
        

        const options = {
        method: 'GET',
        url: `${monoBaseUrl}/accounts/${exchangetoken}/identity`,
        headers: {accept: 'application/json', 'mono-sec-key': 'live_sk_uueEcsoBUSfcSFekEkv6'}
        };

        request(options, async function (error, response, body) {
       if(!error){
        const resultOut= await JSON.parse(response.body);
        console.log(resultOut);
        return res.status(200).json({ status: 200, msg: 'User details found successfully',resultOut});
       }
         return res.status(400).json({ status: 400, msg: 'An error has occured while getting account details',error});

        });

    }catch(error:any){
        return res.status(500).json({ status: 500, error: error.message });
    }
}

export async function getTransactionHistory(req:Request|any,res:Response,next:NextFunction){
    try{
        const validated=getTransactionHistorySchema.validate(req.body,options);
        if(validated.error){
            return res.status(400).json({ status: 400, error: validated.error.details[0].message });
        }
        const {duration}=req.body;
        const userId=req.user.id;
        const SecretData:any=await ExchangeTokenInstance.findOne({ where: { userId:userId } });
        if (!SecretData) {
            return res.status(404).json({ status: 404, error: 'Account not found' });
        }
        const {exchangetoken}=SecretData;

        const option= {
        method: 'GET',
        url: `${monoBaseUrl}/accounts/${exchangetoken}/statement?period=last${duration}months&output=Json`,
        headers: {accept: 'application/json', 'mono-sec-key': 'live_sk_uueEcsoBUSfcSFekEkv6'}
        };

        request(option, async function (error, response, body) {
       if(!error){
        const resultOut=await JSON.parse(response.body);
        console.log(resultOut);
        return res.status(200).json({ status: 200, msg: 'User details found successfully',resultOut});
         }
            return res.status(400).json({ status: 400, msg: 'An error has occured while getting account details',error});
        });

    }catch(error:any){
        return res.status(500).json({ status: 500, error: error.message });
    }
}

export async function getClinetInvestment(req:Request|any, res:Response,next:NextFunction){
    try{
        const userId=req.user.id;
        const SecretData:any=await ExchangeTokenInstance.findOne({ where: { userId:userId } });
        if (!SecretData) {
            return res.status(404).json({ status: 404, error: 'Account not found' });
        }
        const {exchangetoken}=SecretData;

       

        const options = {
        method: 'GET',
        url: `${monoBaseUrl}/accounts/${exchangetoken}/assets`,
        headers: {accept: 'application/json', 'mono-sec-key': monoSecretKey}
        };

        request(options, async function (error:any, response:Response|any, body:any) {
       if(!error){
        const resultOut=await JSON.parse(response.body);
        console.log(resultOut);
        return res.status(200).json({ status: 200, msg: 'User details found successfully',resultOut});
         }
            return res.status(400).json({ status: 400, msg: 'An error has occured while getting account details',error});

        });

    }catch(error:any){
        return res.status(500).json({ status: 500, error: error.message });
    }
}

export async function getClientEarnings(req:Request|any, res:Response, next:NextFunction){
    try{
        const userId=req.user.id;
        const SecretData:any=await ExchangeTokenInstance.findOne({ where: { userId:userId } });
        if (!SecretData) {
            return res.status(404).json({ status: 404, error: 'Account not found' });
        }
        const {exchangetoken}=SecretData;


        const options = {
        method: 'GET',
        url: `${monoBaseUrl}/accounts/${exchangetoken}/earnings`,
        headers: {accept: 'application/json', 'mono-sec-key': monoSecretKey}
        };

        request(options, async function (error, response, body) {
         if(!error){
        const resultOut:any=await JSON.parse(response.body);
        console.log(resultOut);
        return res.status(200).json({ status: 200, msg: 'User details found successfully',resultOut});
            }
            return res.status(400).json({ status: 400, msg: 'An error has occured while getting account details',error});

        });

    }catch(error:any){
        return res.status(500).json({ status: 500, error: error.message });
    }
}
//636bccb8821b514843ab899c
        //live_sk_uueEcsoBUSfcSFekEkv6

    export async function getClientsCreditInflow(req:Request|any, res:Response, next:NextFunction){
        try{
            const userId=req.user.id;
            const SecretData:any=await ExchangeTokenInstance.findOne({ where: { userId:userId } });
            if (!SecretData) {
                return res.status(404).json({ status: 404, error: 'Account not found' });
            }
            const {exchangetoken}=SecretData;
    
            const options = {
            method: 'GET',
            url: `${monoBaseUrl}/accounts/${exchangetoken}/credits`,
            headers: {accept: 'application/json', 'mono-sec-key': monoSecretKey}
            };
    
            request(options, async function (error, response, body) {
             if(!error){
            const resultOut=await JSON.parse(response.body);
            console.log(resultOut);
            return res.status(200).json({ status: 200, msg: 'User details found successfully',resultOut});
                }
                return res.status(400).json({ status: 400, msg: 'An error has occured while getting account details',error});
    
            });
    
        }catch(error:any){
            return res.status(500).json({ status: 500, error: error.message });
        }
    }

    export async function getClientsDebitInflow(req:Request|any, res:Response, next:NextFunction){
        try{
            const userId=req.user.id;
            const SecretData:any=await ExchangeTokenInstance.findOne({ where: { userId:userId } });
            if (!SecretData) {
                return res.status(404).json({ status: 404, error: 'Account not found' });
            }
            const {exchangetoken}=SecretData;
    
            const request = require('request');

            const options = {
              method: 'GET',
              url: `${monoBaseUrl}/accounts/${exchangetoken}/debits?api_key=${monoAppId}`,
              headers: {accept: 'application/json', 'mono-sec-key': monoSecretKey}
            };
            
            request(options, async function (error:Request|any, response:Response|any, body:any) {
               if(!error){
                const resultOut=await JSON.parse(response.body);
                console.log(resultOut);
                return res.status(200).json({ status: 200, msg: 'User details found successfully',resultOut});
                 }
                    return res.status(400).json({ status: 400, msg: 'An error has occured while getting account details',error});

            });
    
        }catch(error:any){
            return res.status(500).json({ status: 500, error: error.message });
        }
    }


   export async function directPayLogin(req:Request|any, res:Response, next:NextFunction){
        try{
            const { error } = monoSessionLoginSchema.validate(req.body, options);
        if (error) {
            return res.status(400).json({ status: 400, error: error.details[0].message });
        }
        const { institution } = req.body;
        const userId=req.user.id;
        const tokenData=await ExchangeTokenInstance.findOne({where:{userId:userId}})
    
        const userBankInfo:any = await BankAccountInstance.findOne({ where: { userId:userId, bankcode:institution } });
        if (!userBankInfo) {
            return res.status(404).json({ status: 404, error: 'Bank Account not found' });
        }
        const {servicetype,username,password}=userBankInfo;
        const detokenizedUsername:any=jwt.verify(username, secret as string);
        const decryptedUsername=detokenizedUsername.username;
        const detokenizedPassword:any=jwt.verify(password, secret as string);
        const decryptedPassword=detokenizedPassword.password;
        const auth_method = servicetype;
       

        const option = {
        method: 'POST',
        url: `${monoBaseUrl}/v1/connect/session`,
        headers: {
            accept: 'application/json',
            'mono-sec-key': monoSecretKey,
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            app: monoAppId,
            auth_method: auth_method,
            institution: institution
        }),
        
        };

        request(option, async function (error:any, response:Response|any, body:any) {
            const resultOut= await JSON.parse(response.body);
           
            if(resultOut.status!=='successful'){
                return res.status(400).json({ status: 400, msg: 'An error has occured while getting account details',error});
            }
            const sessionID=resultOut.id;
            const storeSession = await DirectPayInstance.update({sessionId:sessionID},{ where: { userId:userId } });
            const options = {
            method: 'POST',
            url: `${monoBaseUrl}/v1/connect/login`,
            headers: {
                accept: 'application/json',
                'x-session-id': sessionID,
                'mono-sec-key': monoSecretKey,
                'content-type': 'application/json'
            },
            body: JSON.stringify({username: decryptedUsername, password: decryptedPassword}),
            };
            request(options, async function (error:any, response:Response|any, body:any) {
                if(!error){
                    const resultOut= await JSON.parse(response.body);

                    const loginCode=resultOut.data.code;

                     const storeSessionCode = await DirectPayInstance.update({logintoken:loginCode},{ where: { userId:userId } });
                     const storedDirectTable=await DirectPayInstance.findOne({where:{userId:userId}})
                   
                   
                    return res.status(200).json({ status: 200, msg: 'User details found successfully',resultOut,storedDirectTable});
                }
                return res.status(400).json({ status: 400, msg: 'An error has occured while getting account details',error});

            });
                    });
        }catch(error:any){
            return res.status(500).json({ status: 500, error: error.message });
        }

        }

        export async function directPaySession(req:Request|any,res:Response,next:NextFunction){
            try{
                const userId=req.user.id;
                const validateData=directpaySessionSchema.validate(req.body, options);
                if(validateData.error){
                    return res.status(400).json({ status: 400, error: validateData.error.details[0].message });
                }
                const {description,amount} = req.body;
                const directPaySecret:any=await DirectPayInstance.findOne({where:{userId:userId}})
                if (!directPaySecret) {
                    return res.status(404).json({ status: 404, error: 'Direct Pay not found' });
                }
                const {sessionId}=directPaySecret;
                const reference=uuidv4();
                

            const option = {
            method: 'POST',
            url: `${monoBaseUrl}/v1/direct-pay/session`,
            headers: {
                accept: 'application/json',
                'mono-sec-key': monoSecretKey,
                'x-session-id': sessionId,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                type: 'onetime-debit',
                amount: amount,
                description: description,
                reference: reference
            }),
            };

            request(option, async function (error, response, body) {
                if(!error){
                    const resultOut= await JSON.parse(response.body);
                    const directPaySessionCode= await DirectPayInstance.update({exchangetoken:resultOut.code},{ where: { userId:userId } });
                    const storedDirectTable=await DirectPayInstance.findOne({where:{userId:userId}})
                    return res.status(200).json({ status: 200, msg: 'User details found successfully',resultOut,storedDirectTable});
                }
                return res.status(400).json({ status: 400, msg: 'An error has occured while getting account details',error});

            });

            }catch(error:any){
                return res.status(500).json({ status: 500, error: error.message });
            }
        }


        export async function createCharge(req:Request|any,res:Response, next:NextFunction){
            try{
               const userId=req.user.id;
                const validateData=createChargeSchema.validate(req.body, options);

                if(validateData.error){
                    return res.status(400).json({ status: 400, error: validateData.error.details[0].message });
                }
                const {token}=req.body;
                const directPaySecret:any=await DirectPayInstance.findOne({where:{userId:userId}})
                if (!directPaySecret) {
                    return res.status(404).json({ status: 404, error: 'Direct Pay not found' });
                }
                const {sessionId}=directPaySecret;
                const option = {
                method: 'POST',
                url: `${monoBaseUrl}/v1/direct-pay/charge`,
                headers: {
                    accept: 'application/json',
                    'mono-sec-key': monoSecretKey,
                    'x-session-id': sessionId,
                    'content-type': 'application/json'
                },
                body: JSON.stringify({token: token}),
                };

                request(option, function (error:any, response:Response|any, body:any) {
                    if(!error){
                        const resultOut= JSON.parse(response.body);
                        return res.status(200).json({ status: 200, msg: 'User details found successfully',resultOut});
                    }
                    return res.status(400).json({ status: 400, msg: 'An error has occured while getting account details',error});

                });
            }catch(error:any){
                return res.status(500).json({ status: 500, error: error.message });
            }
        }