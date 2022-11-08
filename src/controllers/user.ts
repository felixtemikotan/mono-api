import dotenv from "dotenv";
import express, { Request, Response, NextFunction } from "express";
import { v4 as uuidv4, validate } from "uuid";
import { UserInstance }  from "../models/users";
import { BankAccountInstance }  from "../models/bankaccount";
import {options,createUserSchema, loginUserSchema, createBankAccountSchema,updateUserSchema, updateBankAccountSchema } from '../util/utils'
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { generateToken } from "../util/utils";
const secret = process.env.JWT_SECRET as string


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
        const token = jwt.sign({ id: user.id }, process.env.SECRET_KEY as string);
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
        const user = await UserInstance.findOne({ where: { id } });
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


export async function createBankAccount(req: Request, res: Response, next: NextFunction) {
    try {
        const { error } = createBankAccountSchema.validate(req.body, options);
        if (error) {
            return res.status(400).json({ status: 400, error: error.details[0].message });
        }
        const { userId,accountnumber, accountname, bankname, bankcode, accounttype } = req.body;
        const duplicateAccountnumber = await BankAccountInstance.findOne({ where: { accountnumber } });
        if (duplicateAccountnumber) {
            return res.status(409).json({ status: 409, error: 'Accountnumber already exist' });
        }
        const id = uuidv4();
        const bankaccount = await BankAccountInstance.create({
            id,
            userId,
            accountnumber,
            accountname,
            bankname,
            bankcode,
            accounttype,
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
        const { accountnumber, accountname, bankname, bankcode, accounttype } = req.body;
        const bankaccount = await BankAccountInstance.findOne({ where: { id } });
        if (!bankaccount) {
            return res.status(404).json({ status: 404, error: 'Bank Account not found' });
        }
        const record=await BankAccountInstance.update({ accountnumber, accountname, bankname, bankcode, accounttype }, { where: { id } });
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