import dotenv from "dotenv";
import express, { Request, Response, NextFunction } from "express";
import { v4 as uuidv4, validate } from "uuid";
import { UserInstance }  from "../models/users";
import { BankAccountInstance }  from "../models/bankaccount";
import { LinkedBankInstance } from "../models/linkedBanks";
import {options,createUserSchema, loginUserSchema, createBankAccountSchema,updateUserSchema,monoSessionLoginSchema,
    updateBankAccountSchema, monoLoginSchema, createMonoSessionSchema, otpLoginSchema, getTransactionHistorySchema, directpaySessionSchema, createChargeSchema, captureChargeSchema, confirmPaymentVerificationSchema } from '../util/utils'
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

/*
bankId: string;
  userId: string,
  icon: string;
  bankName: string;
  username: string;
  password: string;
  wallet: number,
*/
export async function monoSessionLoginCredential(req:Request|any,res:Response,next:NextFunction){
    try{
        // const { error } = monoSessionLoginSchema.validate(req.body, options);
        // if (error) {
        //     return res.status(400).json({ status: 400, error: error.details[0].message });
        // }
        const {userId, bankId,password,username,icon,bankName,servicetype} = req.body;
        //const userId=req.user.id;
        const userBankInfo:any = await BankAccountInstance.findOne({ where: { userId:userId, bankcode:bankId } });
        if (!userBankInfo) {
            return res.status(404).json({ status: 404, error: 'Bank Account not found' });
        }
        const id = uuidv4();

        const tokenizedUsername=jwt.sign({ username:username }, secret as string);
        const tokenizedPassword=jwt.sign({ password:password }, secret as string);

       
        const detokenizedUsername:any=jwt.verify(username, secret as string);
        const detokenizedPassword:any=jwt.verify(password, secret as string);
        const auth_method = servicetype;
        // console.log(auth_method);

        //const BASE_API_URL = 'https://api.withmono.com'
        const response:any = await axios.post(`${monoBaseUrl}/v1/connect/session`, {
            app: monoAppId,
            institution: bankId,
            auth_method: auth_method
        },
        {
            headers: { "mono-sec-key": monoSecretKey},
        }
        )
       
        if(!response.data.status){
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
            body: JSON.stringify({username: username, password: password})
          };
         //console.log(detokenizedUsername.username, detokenizedPassword.password);
          request(option, async function (error, response) { 
            if (error) {
                return res.status(400).json({ status: 400, error: error});  
            }
            const result:any = await JSON.parse(response.body);
          
            if(!result.status || result.status ===400){ 
                return res.status(400).json({ status: 400, message: result});
            }
            console.log(result);


           const record = await ExchangeTokenInstance.update({ logintoken:result.data.code }, { where: { userId:userId } });
           const recordOut = await ExchangeTokenInstance.findOne({ where: { userId:userId } });


           const linkedDetails = await LinkedBankInstance.create({
                bankId: bankId,
                userId: userId,
                icon: icon,
                bankName: bankName,
                username: detokenizedUsername,
                password: detokenizedPassword,
                wallet: 0.00,
           });

           return res.status(200).json({ status: 200, msg: 'Mono Login successful',linkedDetails });
          });
       
        

    }catch(error:any){
        return res.status(500).json({ status: 500, error: error.message });
    }
}
