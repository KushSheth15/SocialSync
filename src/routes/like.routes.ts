import { Router } from 'express';

import {LIKE_ROUTES} from '../constants/api.constant';
import {
  likePost,
  likeComment
} from '../controllers/like.controller';
import { verifyToken } from '../middlewares/jwt.middleware';

const router = Router();

router.post(LIKE_ROUTES.LIKE_POST,verifyToken,likePost);

router.post(LIKE_ROUTES.LIKE_COMMENT,verifyToken,likeComment);

export default router;