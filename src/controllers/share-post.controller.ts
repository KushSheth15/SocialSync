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

/**
 * Shares a post with a recipient user.
 * @param req - The request object containing user information, postId, and recipientUserId in the body.
 * @param res - The response object.
 * @param next - The next middleware function.
 */

export const sharePost = asyncHandler(
  async (req:MyUserRequest,res:Response,next:NextFunction)=>{
    const user = req.user;
    const {postId , recipientUserId} = req.body;

    if(!user){
      return next(
        new ApiError(401, localeService.translate('USER_NOT_FOUND'))
      );
    }

    try {
      const post = await db.Post.findByPk(postId);
      if (!post) {
        return next(
          new ApiError(404, localeService.translate('POST_NOT_FOUND'))
        );
      }

      const recipientUser = await db.User.findByPk(recipientUserId);
      if (!recipientUser) {
        return next(
          new ApiError(404, localeService.translate('RECIPIENT_USER_NOT_FOUND'))
        );
      }

      if (recipientUser.profileVisibility === 'PRIVATE') {
        return next(
          new ApiError(403, localeService.translate('USER_PROFILE_PRIVATE'))
        );
      }

      if (recipientUser.profileVisibility === 'FRIENDS_ONLY') {
        const isFriend = await db.Friendship.findOne({
          where: {
            requesterId: user.id,
            receiverId: recipientUserId
          }
        });

        if (!isFriend) {
          return next(
            new ApiError(403, localeService.translate('USER_NOT_FRIENDS'))
          );
        }
      }

      const sharePost = await db.SharePost.create({
        userId: user.id,
        postId,
        recipientUserId,
      });

      const response = new ApiResponse(
        201,
        sharePost,
        localeService.translate('POST_SHARED_SUCCESSFULLY')
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
  }
);