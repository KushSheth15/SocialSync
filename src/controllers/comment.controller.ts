import {Response, NextFunction } from 'express';

import db from '../sequelize-client';
import { MyUserRequest } from '../types/request-interface';
import ApiError from '../utils/api-error';
import ApiResponse from '../utils/api-response';
import asyncHandler from '../utils/async-handler';
import i18n from '../utils/intl/i18n-config';
import { LocaleService } from '../utils/intl/locale-service';

const localeService = new LocaleService(i18n);

export const createComment = asyncHandler(
  async(req:MyUserRequest,res:Response,next:NextFunction)=>{
    const user = req.user;
    const { postId, content } = req.body;

    if(!user){
      return next(
        new ApiError(401, localeService.translate('USER_NOT_FOUND'))
      );
    }

    if(!postId || !content){
      return next(
        new ApiError(400, localeService.translate('MISSING_REQUIRED_FIELDS'))
      );
    }

    try {
      const post = await db.Post.findByPk(postId);
      if(!post){
        return next(
          new ApiError(404, localeService.translate('POST_NOT_FOUND'))
        );
      }

      const newComment = await db.Comment.create({
        content,
        userId: user.id,
        postId
      });

      const response = new ApiResponse(
        201,
        newComment,
        localeService.translate('COMMENT_ADDED_SUCCESSFULLY')
      );
      res.status(201).json(response);
    } catch (error) {
      console.error(error);
      return next(
        new ApiError(
          500, 
          localeService.translate('INTERNAL_SERVER_ERROR'), 
          [error]
        )
      );
    }
  });

export const getCommentByPost = asyncHandler(
  async (req:MyUserRequest,res:Response,next:NextFunction)=>{
    const {postId} = req.params;

    try {
      const post = await db.Post.findByPk(postId,{
        include:[
          {
            model:db.Comment,
            as:'comments',
            attributes:['content','createdAt'],
            where:{postId},
            required:false
          }
        ]
      });
      if(!post){
        return next(
          new ApiError(404, localeService.translate('POST_NOT_FOUND'))
        );
      }
      const response = new ApiResponse(
        200,
        { postContent: post.content, comments: post.comments },
        localeService.translate('COMMENTS_FETCHED_SUCCESSFULLY')
      );
      res.status(200).json(response);
    } catch (error) {
      console.error(error);
      return next(
        new ApiError(
          500, 
          localeService.translate('INTERNAL_SERVER_ERROR'), 
          [error]
        )
      );
    }
  });

export const updateComment = asyncHandler(
  async (req:MyUserRequest,res:Response,next:NextFunction)=>{
    const user = req.user;
    const {id} = req.params;
    const {content} = req.body;
    if(!user){
      return next(
        new ApiError(401, localeService.translate('USER_NOT_FOUND'))
      );
    }

    if(!content){
      return next(
        new ApiError(400, localeService.translate('MISSING_REQUIRED_FIELDS'))
      );
    }

    try {
      const comment = await db.Comment.findByPk(id);
      if(!comment){
        return next(
          new ApiError(404, localeService.translate('COMMENT_NOT_FOUND'))
        );
      }

      comment.content = content;
      await comment.save();

      const response = new ApiResponse(
        200,
        comment,
        localeService.translate('COMMENT_UPDATED_SUCCESSFULLY')
      );
      res.status(200).json(response);
    } catch (error) {
      console.error(error);
      return next(
        new ApiError(
          500, 
          localeService.translate('INTERNAL_SERVER_ERROR'), 
          [error]
        )
      );
    }
  });

export const deleteComment = asyncHandler(
  async (req:MyUserRequest,res:Response,next:NextFunction)=>{
    const user = req.user;
    const {id} = req.params;
    if(!user){
      return next(
        new ApiError(401, localeService.translate('USER_NOT_FOUND'))
      );
    }

    try {
      const comment = await db.Comment.findByPk(id);
      if(!comment){
        return next(
          new ApiError(404, localeService.translate('COMMENT_NOT_FOUND'))
        );
      }

      await comment.destroy();

      const response = new ApiResponse(
        200,
        null,
        localeService.translate('COMMENT_DELETED_SUCCESSFULLY')
      );
      res.status(200).json(response);
    } catch (error) {
      console.error(error);
      return next(
        new ApiError(
          500, 
          localeService.translate('INTERNAL_SERVER_ERROR'), 
          [error]
        )
      );
    }
  });