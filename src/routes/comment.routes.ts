import { Router } from 'express';

import {COMMENT_ROUTES} from '../constants/api.constant';
import {
  createComment,
  getCommentByPost,
  updateComment,
  deleteComment
} from '../controllers/comment.controller';
import { verifyToken } from '../middlewares/jwt.middleware';

const router = Router();

router.post(COMMENT_ROUTES.ADD,verifyToken,createComment);
router.get(COMMENT_ROUTES.GET_BY_POST,verifyToken,getCommentByPost);
router.put(COMMENT_ROUTES.UPDATE,verifyToken,updateComment);
router.delete(COMMENT_ROUTES.DELETE,verifyToken,deleteComment);

export default router;