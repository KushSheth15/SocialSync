import { Router } from 'express';

import {POST_ROUTES} from '../constants/api.constant';
import {
  createPost,
  getAllPost,
  getPostById,
  updatePost,
  deletePost,
  viewPost
} from '../controllers/post.controller';
import {verifyToken} from '../middlewares/jwt.middleware';
import upload from '../middlewares/multer.middleware';
const router = Router();

router.post(POST_ROUTES.CREATE,verifyToken,upload.single('media'),createPost);
router.get(POST_ROUTES.GET_ALL,verifyToken,getAllPost);
router.get(POST_ROUTES.GET_BY_ID,verifyToken,getPostById);
router.put(POST_ROUTES.UPDATE,verifyToken,updatePost);
router.delete(POST_ROUTES.DELETE,verifyToken,deletePost);
router.get(POST_ROUTES.VIEW,verifyToken,viewPost);

export default router;