import express, { Router } from 'express';
import adminController from '../controllers/adminController';

const router: Router = express.Router();

router.post('/licenses/generate', adminController.generateLicense);
router.get('/licenses', adminController.listLicenses.bind(adminController));

export default router;