import express from 'express';
const router = express.Router();
import medicineController from '../controllers/medicineController.js';
import {authenticate,authorize} from '../middleware/auth.js';

router.get('/', authenticate, medicineController.getAll);
router.get('/low-stock', authenticate, medicineController.getLowStock);
router.get('/expiring-soon', authenticate, medicineController.getExpiringSoon);
router.get('/:id', authenticate, medicineController.getById);
router.post('/', authenticate, authorize('admin', 'pharmacist'), medicineController.create);
router.put('/:id', authenticate, authorize('admin', 'pharmacist'), medicineController.update);
router.delete('/:id', authenticate, authorize('admin'), medicineController.delete);

export default router;