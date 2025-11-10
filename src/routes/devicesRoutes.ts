import express, { Router } from 'express';
import deviceController from '../controllers/deviceController';

const router: Router = express.Router();

router.get('/:deviceId/validate', deviceController.validateDevice.bind(deviceController));
router.post('/register', deviceController.registerDevice.bind(deviceController));

export default router;