import express from 'express'
const router = express.Router();
import purchaseController from '../controllers/purchaseController.js';
import {authenticate, authorize} from '../middleware/auth.js';

router.get('/', authenticate, purchaseController.getAll);
router.get('/:id', authenticate, purchaseController.getById);
router.post('/', authenticate, authorize('admin', 'pharmacist'), purchaseController.create);
router.put('/:id', authenticate, authorize('admin', 'pharmacist'), purchaseController.update);
router.delete('/:id', authenticate, authorize('admin'), purchaseController.delete);

export default router;