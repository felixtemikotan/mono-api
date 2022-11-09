import express from 'express';
const router = express.Router()
import { auth } from '../middleware/auth';
import { createUser,loginUser, updateUser, getUser,monoSessionLogin, getAllUsers,deleteUser, createBankAccount, tokenSignin, 
    updateBankAccount,getAllBankAccounts, deleteBankAccount,getMonoAccountDetails,exchangeToken, getAllMonoBanks } from '../controllers/user';


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
router.post('/login-to-bank',auth, monoSessionLogin);
router.get('/get-all-banks', auth, getAllMonoBanks);
router.post('/exchangetoken',auth, exchangeToken)
router.get('/get-account-details', auth, getMonoAccountDetails)

export default router