import express from 'express';
const router = express.Router()
import { auth } from '../middleware/auth';
import { createUser,loginUser, updateUser, getUser, getAllUsers,deleteUser, createBankAccount, tokenSignin, updateBankAccount,getAllBankAccounts, deleteBankAccount, createMonoSession, monoLogin } from '../controllers/user';


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
router.post('/createmonosession',createMonoSession);
router.post('/monologin',monoLogin);
router.post('/tokensignin',tokenSignin);
export default router