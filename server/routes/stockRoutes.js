import express from 'express';
const router = express.Router();
import stockController from '../controllers/stockController.js';
import {authenticate,authorize} from '../middleware/auth.js';

router.get('/', authenticate, stockController.getAll);
router.get('/:id', authenticate, stockController.getById);
router.get('/medicine/:medicine_id', authenticate, stockController.getByMedicine);
router.post('/', authenticate, authorize('admin', 'pharmacist'), stockController.create);
router.put('/:id', authenticate, authorize('admin', 'pharmacist'), stockController.update);
router.delete('/:id', authenticate, authorize('admin'), stockController.delete);

export default router;