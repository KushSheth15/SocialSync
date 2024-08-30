import { Router } from 'express';

import {
  registerUser,
  loginUser,
  uploadProfile,
  updateProfile,
  getUserProfile
} from '../controllers/user.controller';
import {verifyToken} from '../middlewares/jwt.middleware';
import upload from '../middlewares/multer.middleware';
import validate from '../middlewares/validate.middleware';
import {registerSchema,loginSchema} from '../validators/user.validators';
const router = Router();

router.post('/register',validate(registerSchema),registerUser);

router.post('/login',validate(loginSchema),loginUser);

router.post('/upload-profile',
  verifyToken,
  upload.single('profileImage'),
  uploadProfile
);

router.patch('/update-profile',
  verifyToken,
  upload.single('profileImage'),
  updateProfile
);

router.get('/get-profile/:id',
  verifyToken,
  getUserProfile
);

export default router;