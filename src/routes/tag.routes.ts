import { Router } from 'express';

import {
  tagUserInPost
} from '../controllers/tag.controller';
import { verifyToken } from '../middlewares/jwt.middleware';

const router = Router();

router.post('/tag-user',verifyToken,tagUserInPost);

export default router;