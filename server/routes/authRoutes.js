import express from 'express';
const router = express.Router();
import authController from '../controllers/authController.js';
import {authenticate,authorize} from '../middleware/auth.js';

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authenticate, authController.logout);
router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, authController.updateProfile);
router.put('/change-password', authenticate, authController.changePassword);

router.get('/users', authenticate, authorize('admin'), authController.getAllUsers);
router.put('/users/:id', authenticate, authorize('admin'), authController.updateUser);
router.delete('/users/:id', authenticate, authorize('admin'), authController.deleteUser);

export default router;