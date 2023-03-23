import dotenv from "dotenv";
import express, { Request, Response, NextFunction } from "express";
import { v4 as uuidv4, validate } from "uuid";
import { UserInstance }  from "../models/users";

import { LinkedBankInstance } from "../models/linkedBanks";
import {options,   monoSchema } from '../util/utils'
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import request from 'request';
import axios from 'axios';
import {TransactionInstance} from '../models/transactions';
const secret = process.env.JWT_SECRET as string;
const monoSecretKey = process.env.MONO_SECRET_KEY as string;
const monoAppId = process.env.MONO_APP_ID as string;
const monoBaseUrl = process.env.BASE_API_URL as string; 


export async function monoSessionLoginCredential(req:Request|any,res:Response,next:NextFunction){
    try{
        
        const { error } = monoSchema.validate(req.body, options);
        
        if (error) {
            return res.status(400).json({ status: 400, error: error.details[0].message });
        }
        
        const {userId, bankId,password,username,icon,bankName,serviceType} = req.body;
        
        const id = uuidv4();

        const tokenizedUsername=jwt.sign({ username:username }, secret as string);
        const tokenizedPassword=jwt.sign({ password:password }, secret as string);

       
        const auth_method = serviceType;
        
        const monoBody={
            app: monoAppId,
            institution: bankId,
            auth_method: auth_method
        }
        const response:any = await axios.post(`${monoBaseUrl}/v1/connect/session`, 
        monoBody,
        {
            headers: { "mono-sec-key": monoSecretKey},
        }
        )
       
        if(!response.data.status){
            return res.status(400).json({ status: 400, error: 'An error has occured while creating mono session',response });
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
            const {data} = result;

        //    const record = await ExchangeTokenInstance.update({ logintoken:result.data.code }, { where: { userId:userId } });
        //    const recordOut = await ExchangeTokenInstance.findOne({ where: { userId:userId } });

           const linkedDetails = await LinkedBankInstance.create({
                id:id,
                bankId: bankId,
                userId: userId,
                icon: icon,
                bankName: bankName,
                username: tokenizedUsername,
                password: tokenizedPassword,
                serviceType:serviceType,
                wallet: 0.00,
           });
          
           const linkedBanks = await LinkedBankInstance.findAll({ where: {} });
           
           return res.status(200).json({ status: 200, msg: 'Mono Login successful',linkedBanks, });
          });

    }catch(error:any){
        return res.status(500).json({ status: 500, error: error.message });
    }
}

export async function getLinkedBank(req:Request,res:Response) {
    try {
        
        const {userId} = req.params;
        console.log("userId :",userId);
        const linkedBanks = await LinkedBankInstance.findAll({ where: {userId} });
        return res.status(200).json({ status: 200, msg: 'Bank Accounts found successfully',linkedBanks });
    } catch (error: any) {
        return res.status(500).json({ status: 500, error: error.message });
    }
    
}


export async function monoDirectPay(req:Request,res:Response){
  try{
    const {userId,amount,description,id} = req.body;
    const bankDetails :any = await LinkedBankInstance.findOne({ where: { userId:userId, id:id } })
    if (!bankDetails) {
        return res.status(404).json({ status: 404, error: 'bank credentials not found' });
    }
    const {serviceType,username,password,bankId} = bankDetails;

    const detokenizedUsername:any=jwt.verify(username, secret as string);
    const decryptedUsername=detokenizedUsername.username;
    const detokenizedPassword:any=jwt.verify(password, secret as string);
    const decryptedPassword=detokenizedPassword.password;
    const auth_method = serviceType;

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
            institution: bankId
        })
    };
    
    request(option, async function (error:any, response:Response|any, body:any){
     
        const resultOut= await JSON.parse(response.body);
           
        if(resultOut.status!=='successful'){
                return res.status(400).json({ status: 400, msg: 'An error has occured while getting account details',error});
        }
        const sessionID=resultOut.id;
        const options = {
            method: 'POST',
            url: `${monoBaseUrl}/v1/connect/login`,
            headers: {
                accept: 'application/json',
                'x-session-id': sessionID,
                'mono-sec-key': monoSecretKey,
                'content-type': 'application/json'
            },
            body: JSON.stringify({username: decryptedUsername, password: decryptedPassword})
        };

        request(options, async function (error:any, response:Response|any, body:any) {
            if(!error){
                const resultOut= await JSON.parse(response.body);
                 console.log(resultOut);
                if(!resultOut.status || resultOut.status === 400){
                    return res.status(400).json({ status: 400, msg: 'An error has occured while trying to connect to your bank. Please try again later',resultOut});
                }

                const loginCode=resultOut.data.code;
                 //const storeSessionCode = await DirectPayInstance.update({logintoken:loginCode},{ where: { userId:userId } });
                 //const storedDirectTable=await DirectPayInstance.findOne({where:{userId:userId}})
               
               
                const reference=uuidv4();
                const option = {
                    method: 'POST',
                    url: `${monoBaseUrl}/v1/direct-pay/session`,
                    headers: {
                        accept: 'application/json',
                        'mono-sec-key': monoSecretKey,
                        'x-session-id': sessionID,
                        'content-type': 'application/json'
                    },
                    body: JSON.stringify({type: 'onetime-debit', amount: amount*100,description: description,reference: reference})
                };

                request(option, async function (error, response, body) {
                    
                    
                    //console.log(response);
                    const resultOut= JSON.parse(response.body);
                    console.log("resultOut ",resultOut);
                    if(!error){
                      
                       
                        
                        //const directPaySessionCode= await DirectPayInstance.update({exchangetoken:resultOut.code},{ where: { userId:userId } });
                        //const storedDirectTable=await DirectPayInstance.findOne({where:{userId:userId}})
                        const initialAmount:any = await LinkedBankInstance.findOne({where:{id:id}});
                        const {wallet} = initialAmount;
                        const balance = wallet + resultOut.data.session.amount;
                 
                        const updateLinkedBank = await LinkedBankInstance.update({wallet:balance},{where:{id:id}});
                        //const id = uuidv4();
                        const transactionDetails = await TransactionInstance.create({
                            id:resultOut.data.session.id,
                            userId:userId,
                            bankId:bankId,
                            sessionId:sessionID,
                            loginToken:loginCode,
                            exchangeToken:resultOut.code,
                            amount:resultOut.data.session.amount,
                            description:resultOut.data.session.description,
                            referrence:resultOut.data.session.reference,
                        })
                        // console.log("reached here");
                        return res.status(200).json({ status: 200,responseCode:resultOut.responseCode,msg: "credit transaction successful",transactionDetails});
                    }
                    return res.status(400).json({ status: 400, msg: 'An error has occured while getting account details',error});
    
                });

                //return res.status(200).json({ status: 200, msg: 'User details found successfully',resultOut});
            }else{
                return res.status(400).json({ status: 400, msg: 'account not found',error});
            }

        });

    });

}catch(err){
    res.status(500).json({status:500,error:"Server error"});
}



}


export async function deleteLinkedBank(req:Request,res:Response) {
    try {
        
        const {id} = req.params;
        const linkedBanks = await LinkedBankInstance.destroy({where:{id}});
        return res.status(200).json({ status: 200, msg: 'Account deleted successfully'});
    } catch (error: any) {
        return res.status(500).json({ status: 500, error: error.message });
    }
    
}
export async function updateLinkedBank(req:Request,res:Response) {
    try {
        
        const {id} = req.params;
        const linkedBanks = await LinkedBankInstance.update({wallet:0.00},{where:{id:id}});
        return res.status(200).json({ status: 200, msg: 'Account updated successfully'});
    } catch (error: any) {
        return res.status(500).json({ status: 500, error: error.message });
    }
    
}