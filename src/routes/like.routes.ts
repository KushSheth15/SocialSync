import { Router } from 'express';

import {
  likePost,
  likeComment
} from '../controllers/like.controller';
import { verifyToken } from '../middlewares/jwt.middleware';

const router = Router();

router.post('/like-post',verifyToken,likePost);

router.post('/like-comment',verifyToken,likeComment);

export default router;