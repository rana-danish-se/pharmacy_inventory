import express from 'express';
const router = express.Router();
import supplierController from '../controllers/supplierController.js';
import {authenticate, authorize} from '../middleware/auth.js';

router.get('/', authenticate, supplierController.getAll);
router.get('/:id', authenticate, supplierController.getById);
router.post('/', authenticate, authorize('admin', 'pharmacist'), supplierController.create);
router.put('/:id', authenticate, authorize('admin', 'pharmacist'), supplierController.update);
router.delete('/:id', authenticate, authorize('admin'), supplierController.delete);

export default router;