import express from 'express';
const router = express.Router()
import { auth } from '../middleware/auth';
import { createUser,loginUser, updateUser, getUser, getAllUsers,deleteUser, createBankAccount, updateBankAccount,getAllBankAccounts, deleteBankAccount } from '../controllers/user';


router.post('/signup', createUser);
router.post('/login', loginUser);
router.put('/update/:id', auth, updateUser);
router.delete('/delete/:id', auth, deleteUser);
router.get('/get/:id', auth, getUser);
router.get('/getall', auth, getAllUsers);
router.post('/createbankaccount', auth, createBankAccount);
router.put('/updatebankaccount/:id', auth, updateBankAccount);
router.delete('/deletebankaccount/:id', auth, deleteBankAccount);
router.get('/getallbankaccounts', auth, getAllBankAccounts);

export default router