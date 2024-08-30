/* eslint-disable max-len */
import {Response, NextFunction } from 'express';

import db from '../sequelize-client';
import { MyUserRequest } from '../types/request-interface';
import ApiError from '../utils/api-error';
import ApiResponse from '../utils/api-response';
import asyncHandler from '../utils/async-handler';
import uploadOnCloudinary from '../utils/cloudinary';
import { isFriend } from '../utils/friendship.utils';
import i18n from '../utils/intl/i18n-config';
import { LocaleService } from '../utils/intl/locale-service';
import redisClient from '../utils/redis-client';

const localeService = new LocaleService(i18n);

export const createPost = asyncHandler(async (req: MyUserRequest, res: Response, next: NextFunction) => {
  const content = req.file?.path;
  const {captions} = req.body;
  const user = req.user;

  if (!user) {
    return next(
      new ApiError(401, localeService.translate('USER_NOT_FOUND'))
    );
  }

  try {
    await redisClient.del('allPosts');

    // Upload profile image if it exists
    let mediaUrl: string | undefined;
    if (content) {
      const postContent = await uploadOnCloudinary(content);
      if (!postContent || !postContent.url) {
        return next(new ApiError(400, localeService.translate('CONTENT_UPLOAD_FAILED')));
      }
      mediaUrl = postContent.url;
    }

    const newPost = await db.Post.create({
      content:mediaUrl as string,
      captions,
      userId: user.id,
    });

    await redisClient.set(`post:${newPost.id}`, JSON.stringify(newPost), 'EX', 3600);

    const response = new ApiResponse(
      201,
      newPost,
      localeService.translate('POST_CREATED_SUCCESSFULLY'),
    );
    res.status(201).json(response);
  } catch (error) {
    console.error(error);
    return next(
      new ApiError(500, localeService.translate('INTERNAL_SERVER_ERROR'), 
        [error]
      ));
  }
});

export const getAllPost = asyncHandler(async (req:MyUserRequest,res:Response,next:NextFunction)=>{
  const user = req.user;
  if(!user){
    return next(
      new ApiError(401, localeService.translate('USER_NOT_FOUND'))
    );
  }

  try {

    const cachedPosts = await redisClient.get('allPosts');
    if(cachedPosts){
      const response = new ApiResponse(200, JSON.parse(cachedPosts), localeService.translate('POST_RETRIEVED_SUCCESSFULLY'));
      return res.status(200).json(response);
    }

    const getPost = await db.Post.findAll();

    await redisClient.set('allPosts', JSON.stringify(getPost), 'EX', 3600);

    const response = new ApiResponse(200,getPost,localeService.translate('POST_RETRIVED_SUCCESSFULLY'));
    return res.status(200).json(response);
  } catch (error) {
    console.error(error);
    return next(
      new ApiError(500, localeService.translate('INTERNAL_SERVER_ERROR'), 
        [error]
      ));
  }
});

export const getPostById = asyncHandler(async (req:MyUserRequest,res:Response,next:NextFunction)=>{
  const user = req.user;
  const {id} = req.params;

  if(!user){
    return next(
      new ApiError(401, localeService.translate('USER_NOT_FOUND'))
    );
  }

  try {
    const cachedPost = await redisClient.get(`post:${id}`);
    if (cachedPost) {
      const response = new ApiResponse(200, JSON.parse(cachedPost), localeService.translate('POST_RETRIEVED_SUCCESSFULLY'));
      return res.status(200).json(response);
    }

    const post = await db.Post.findByPk(id);
    if(!post){
      return next(
        new ApiError(404, localeService.translate('POST_NOT_FOUND'))
      );
    }

    await redisClient.set(`post:${id}`, JSON.stringify(post), 'EX', 3600);

    const response = new ApiResponse(200, post, localeService.translate('POST_RETRIVED_SUCCESSFULLY'));
    return res.status(200).json(response);
  } catch (error) {
    console.error(error);
    return next(
      new ApiError(500, localeService.translate('INTERNAL_SERVER_ERROR'), 
        [error]
      ));
  }
});

export const updatePost = asyncHandler(async (req:MyUserRequest,res:Response,next:NextFunction)=>{
  const user = req.user;
  const {id} = req.params;
  const {content} = req.body;

  if(!user){
    return next(
      new ApiError(401, localeService.translate('USER_NOT_FOUND'))
    );
  }

  try {
    const post = await db.Post.findByPk(id);
    if(!post){
      return next(
        new ApiError(404, localeService.translate('POST_NOT_FOUND'))
      );
    }

    if(post.userId!== user.id){
      return next(
        new ApiError(403, localeService.translate('FORBIDDEN_ACCESS'))
      );
    }

    await post.update({content});

    await redisClient.set(`post:${id}`, JSON.stringify(post), 'EX', 3600);

    const response = new ApiResponse(200, post, localeService.translate('POST_UPDATED_SUCCESSFULLY'));
    return res.status(200).json(response);
  } catch(error){
    console.error(error);
    return next(
      new ApiError(500, localeService.translate('INTERNAL_SERVER_ERROR'), 
        [error]
      ));
  }
});

export const deletePost = asyncHandler(async (req:MyUserRequest,res:Response,next:NextFunction)=>{
  const user = req.user;
  const {id} = req.params;

  if(!user){
    return next(
      new ApiError(401, localeService.translate('USER_NOT_FOUND'))
    );
  }

  try {
    const post = await db.Post.findByPk(id);
    if(!post){
      return next(
        new ApiError(404, localeService.translate('POST_NOT_FOUND'))
      );
    }

    if(post.userId!== user.id){
      return next(
        new ApiError(403, localeService.translate('FORBIDDEN_ACCESS'))
      );
    }

    await post.destroy();

    // Invalidate cache for this post and all posts
    await redisClient.del(`post:${id}`);
    await redisClient.del('allPosts');

    const response = new ApiResponse(200, null, localeService.translate('POST_DELETE_SUCCESSFULLY'));
    return res.status(200).json(response);
  } catch(error){
    console.error(error);
    return next(
      new ApiError(500, localeService.translate('INTERNAL_SERVER_ERROR'), 
        [error]
      ));
  }
}); 

export const viewPost = asyncHandler(async (req:MyUserRequest,res:Response,next:NextFunction)=>{
  const userId = req.user?.id;
  const {postId} = req.params;

  if(!userId){
    return next(
      new ApiError(401, localeService.translate('USER_NOT_FOUND'))
    );
  }

  if(!postId){
    return next(
      new ApiError(400, localeService.translate('INVALID_POST_ID'))
    );
  }

  try {
    // Try to get cached post with additional data
    const cachedPost = await redisClient.get(`viewPost:${postId}`);
    if (cachedPost) {
      const response = new ApiResponse(200, JSON.parse(cachedPost), localeService.translate('POST_RETRIEVED_SUCCESSFULLY'));
      return res.status(200).json(response);
    }

    const post = await db.Post.findByPk(postId, {
      include: [
        { model: db.User, as: 'user', attributes: ['userName', 'profileImage'] },
        { model: db.Comment, as: 'comments', order: [['createdAt', 'ASC']] }
      ],
    });

    if(!post){
      return next(
        new ApiError(400, localeService.translate('POST_NOT_FOUND'))
      );
    }

    const owner = await db.User.findByPk(post.userId);
    if(!owner){
      return next(
        new ApiError(400, localeService.translate('OWNER_NOT_FOUND'))
      );
    }

    if(owner.profileVisibility === 'PUBLIC' || 
      (owner.profileVisibility === 'FRIENDS_ONLY' && await isFriend(userId,post.userId)) || 
      (owner.profileVisibility === 'PRIVATE' && post.userId === userId))
    {
      await redisClient.set(`viewPost:${postId}`, JSON.stringify(post), 'EX', 3600);
        
      const response = new ApiResponse(200, post, localeService.translate('POST_RETRIEVED_SUCCESSFULLY'));
      return res.status(200).json(response);
    }

    return res.status(403).json({ message: localeService.translate('ACCESS_DENIED') });
  } catch (error) {
    console.error(error);
    return next(
      new ApiError(500, localeService.translate('INTERNAL_SERVER_ERROR'), 
        [error]
      ));
  }
});