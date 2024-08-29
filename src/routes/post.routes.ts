import { Router } from 'express';

import {
  createPost,
  getAllPost,
  getPostById,
  updatePost,
  deletePost
  
} from '../controllers/post.controller';
import {verifyToken} from '../middlewares/jwt.middleware';
const router = Router();

router.post('/create-post',verifyToken,createPost);
router.get('/get-post',verifyToken,getAllPost);
router.get('/get-post/:id',verifyToken,getPostById);
router.put('/update-post/:id',verifyToken,updatePost);
router.delete('/delete-post/:id',verifyToken,deletePost);

export default router;