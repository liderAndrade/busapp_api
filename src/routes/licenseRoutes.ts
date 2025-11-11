import express, { Router } from 'express';
import licenseController from '../controllers/licenseController';

const router: Router = express.Router();

router.post('/validate', licenseController.validateCreditLicense);
router.post('/use', licenseController.useLicense);

export default router;