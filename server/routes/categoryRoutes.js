import express from 'express';
const router = express.Router();
import categoryController from '../controllers/categoryController.js';
import {authenticate,authorize} from '../middleware/auth.js';

router.get('/', authenticate, categoryController.getAll);
router.get('/:id', authenticate, categoryController.getById);
router.post('/', authenticate, authorize('admin', 'pharmacist'), categoryController.create);
router.put('/:id', authenticate, authorize('admin', 'pharmacist'), categoryController.update);
router.delete('/:id', authenticate, authorize('admin'), categoryController.delete);

export default router;