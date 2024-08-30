import { Router } from 'express';

import { SHARE_POST_ROUTES } from '../constants/api.constant';

import {
  sharePost
} from '../controllers/share-post.controller';
import { verifyToken } from '../middlewares/jwt.middleware';

const router = Router();

router.post(SHARE_POST_ROUTES.SHARE_POST,verifyToken,sharePost);

export default router;