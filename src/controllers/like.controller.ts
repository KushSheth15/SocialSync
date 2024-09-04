import {Response, NextFunction } from 'express';

import logger from '../logger';
import db from '../sequelize-client';
import { MyUserRequest } from '../types/request-interface';
import ApiError from '../utils/api-error';
import ApiResponse from '../utils/api-response';
import asyncHandler from '../utils/async-handler';
import i18n from '../utils/intl/i18n-config';
import { LocaleService } from '../utils/intl/locale-service';

const localeService = new LocaleService(i18n);

export const likePost = asyncHandler(
  async(req:MyUserRequest,res:Response,next:NextFunction)=>{
    const user = req.user;
    const { postId } = req.body;

    if(!user){
      return next(
        new ApiError(401, localeService.translate('USER_NOT_FOUND'))
      );
    }

    try {
      const post = await db.Post.findByPk(postId);
      if(!post){
        return next(
          new ApiError(404, localeService.translate('POST_NOT_FOUND'))
        );
      }

      const newLike = await db.Like.create({
        userId: user.id,
        postId
      });

      if (post.userId !== user.id) { 
        await db.Notification.create({
          message: `${user.userName} liked your post.`,
          userId: post.userId,
          type: 'LIKE',
          isRead: false
        });
      }

      const response = new ApiResponse(
        201,
        newLike,
        localeService.translate('POST_LIKED_SUCCESSFULLY')
      );
      res.status(201).json(response);
    } catch (error) {
      logger.error(error);
      return next(
        new ApiError(
          500, 
          localeService.translate('INTERNAL_SERVER_ERROR'), 
          [error]
        )
      );
    }
  });

export const likeComment = asyncHandler(
  async(req:MyUserRequest,res:Response,next:NextFunction)=>{
    const user = req.user;
    const { commentId } = req.body;
  
    if(!user){
      return next(
        new ApiError(401, localeService.translate('USER_NOT_FOUND'))
      );
    }
  
    try {
      const comment = await db.Comment.findByPk(commentId);
      if(!comment){
        return next(
          new ApiError(404, localeService.translate('COMMENT_NOT_FOUND'))
        );
      }
  
      const newLike = await db.Like.create({
        userId: user.id,
        commentId
      });
  
      const response = new ApiResponse(
        201,
        newLike,
        localeService.translate('COMMENT_LIKED_SUCCESSFULLY')
      );
      res.status(201).json(response);
    } catch (error) {
      logger.error(error);
      return next(
        new ApiError(
          500, 
          localeService.translate('INTERNAL_SERVER_ERROR'), 
          [error]
        )
      );
    }
  });