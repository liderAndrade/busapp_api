import express, { Router } from 'express';
import licenseController from '../controllers/licenseController';

const router: Router = express.Router();

router.post('/validate', licenseController.validateCreditLicense.bind(licenseController));
router.post('/use', licenseController.useLicense.bind(licenseController));

export default router;