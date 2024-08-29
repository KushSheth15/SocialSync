import { Router } from 'express';

import {
  createComment,
  getCommentByPost,
  updateComment,
  deleteComment
} from '../controllers/comment.controller';
import { verifyToken } from '../middlewares/jwt.middleware';

const router = Router();

router.post('/add-comment',verifyToken,createComment);
router.get('/get-comment/:postId',verifyToken,getCommentByPost);
router.put('/update-comment/:id',verifyToken,updateComment);
router.delete('/delete-comment/:id',verifyToken,deleteComment);

export default router;