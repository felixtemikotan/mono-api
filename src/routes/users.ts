import express from 'express';
const router = express.Router()
import { auth } from '../middleware/auth';
import { createUser,loginUser, updateUser, getUser,monoSessionLogin, getAllUsers,deleteUser, createBankAccount, tokenSignin, 
    updateBankAccount,getAllBankAccounts, deleteBankAccount,getMonoAccountDetails,exchangeToken, getMonoAccountStat,
    getAllMonoBanks,getClientIdentity,getTransactionHistory,getClinetInvestment,getClientEarnings,getClientsCreditInflow,
    getClientsDebitInflow,directPayLogin,directPaySession,createCharge,confirmPaymentVerification } from '../controllers/user';

import {deleteLinkedBank, getLinkedBank, monoDirectPay, monoSessionLoginCredential, updateLinkedBank} from '../controllers/monoController';
import { decode } from 'jsonwebtoken';



router.post('/signup', createUser);
router.post('/login', loginUser);
router.patch('/update/:id', updateUser);
router.delete('/delete/:id', auth, deleteUser);
router.get('/get/:id', auth, getUser);
router.get('/getall', auth, getAllUsers);
router.post('/createbankaccount', auth, createBankAccount);
router.patch('/updatebankaccount/:id', auth, updateBankAccount);
router.delete('/deletebankaccount/:id', auth, deleteBankAccount);
router.get('/getallbankaccounts', auth, getAllBankAccounts);
router.post('/tokensignin',tokenSignin);
router.post('/login-to-bank', monoSessionLogin);
router.get('/get-all-banks', getAllMonoBanks);
router.post('/exchangetoken', exchangeToken);
router.get('/get-account-details', auth, getMonoAccountDetails);
router.get('/get-account-stat', auth, getMonoAccountStat);
router.get('/get-client-identity', auth, getClientIdentity);
router.post('/get-transaction-history', auth, getTransactionHistory);
router.get('/get-client-investment', auth, getClinetInvestment);
router.get('/get-client-earnings', auth, getClientEarnings);
router.get('/get-client-credit-inflow', auth, getClientsCreditInflow);
router.get('/get-client-debit-inflow', auth, getClientsDebitInflow);
router.post('/directpay-login',auth, directPayLogin);
router.post('/directpay-session',auth, directPaySession);
router.post('/create-charge',auth, createCharge);
router.post('/confirm-payment',auth, confirmPaymentVerification);
router.get('/linked-bank/:userId',getLinkedBank);
router.post('/bank-login',monoSessionLoginCredential);
router.post('/direct-pay',monoDirectPay);
router.delete('/delete-linked-banks/:id',deleteLinkedBank);
router.patch('/update-linked-bank/:id',updateLinkedBank);

export default router