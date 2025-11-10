import express, { Router } from 'express';
import transactionController from '../controllers/transactionController';

const router: Router = express.Router();

router.post('/register', transactionController.registerTransaction.bind(transactionController));
router.get('/device/:deviceId', transactionController.getDeviceTransactions.bind(transactionController));

export default router;