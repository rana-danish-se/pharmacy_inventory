import express from 'express';
const router = express.Router();
import saleController from '../controllers/saleController.js';
import { authenticate, authorize } from '../middleware/auth.js';

router.get('/', authenticate, saleController.getAll);
router.get(
  '/report',
  authenticate,
  authorize('admin', 'pharmacist'),
  saleController.getReport
);
router.get('/:id', authenticate, saleController.getById);
router.post('/', authenticate, saleController.create);
router.put(
  '/:id',
  authenticate,
  authorize('admin', 'pharmacist'),
  saleController.update
);
router.delete('/:id', authenticate, authorize('admin'), saleController.delete);
export default router;
