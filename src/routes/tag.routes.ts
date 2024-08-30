import { Router } from 'express';

import { TAG_ROUTES } from '../constants/api.constant';
import {
  tagUserInPost
} from '../controllers/tag.controller';
import { verifyToken } from '../middlewares/jwt.middleware';

const router = Router();

router.post(TAG_ROUTES.TAG_USER,verifyToken,tagUserInPost);

export default router;