import { Router } from 'express';

import {USER_ROUTES} from '../constants/api.constant';
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

router.post(USER_ROUTES.REGISTER,validate(registerSchema),registerUser);

router.post(USER_ROUTES.LOGIN,validate(loginSchema),loginUser);

router.post(USER_ROUTES.UPLOAD_PROFILE,
  verifyToken,
  upload.single('profileImage'),
  uploadProfile
);

router.patch(USER_ROUTES.UPDATE_PROFILE,
  verifyToken,
  upload.single('profileImage'),
  updateProfile
);

router.get(USER_ROUTES.GET_PROFILE,
  verifyToken,
  getUserProfile
);

export default router;