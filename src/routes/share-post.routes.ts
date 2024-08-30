import { Router } from 'express';

import {
  sharePost
} from '../controllers/share-post.controller';
import { verifyToken } from '../middlewares/jwt.middleware';

const router = Router();

router.post('/share-post',verifyToken,sharePost);

export default router;