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
 * Creates a new comment on a post.
 * @param {MyUserRequest} req - The request object containing user and comment data.
 * @param {Response} res - The response object used to send the response.
 * @param {NextFunction} next - The middleware function to pass control to the next handler.
 * @throws {ApiError} Throws an error if user is not found, post is not found, or notification fails.
 * @returns {Promise<void>} Sends a response with the newly created comment.
 */

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

      if(post.userId !== user.id){
        const notification = await db.Notification.create({
          message:`${user.userName} commented on your post`,
          userId:post.userId,
          type:'COMMENT',
          isRead:false
        });

        if (!notification) {
          return next(
            new ApiError(
              500,
              localeService.translate('NOTIFICATION_CREATION_FAILED')
            )
          );
        }
      }
      
      const response = new ApiResponse(
        201,
        newComment,
        localeService.translate('COMMENT_ADDED_SUCCESSFULLY')
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

/**
 * Retrieves comments for a specific post.
 * @param {MyUserRequest} req - The request object containing the post ID parameter.
 * @param {Response} res - The response object used to send the response.
 * @param {NextFunction} next - The middleware function to pass control to the next handler.
 * @throws {ApiError} Throws an error if post is not found.
 * @returns {Promise<void>} Sends a response with the post content and comments.
 */

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

/**
 * Updates an existing comment.
 * @param {MyUserRequest} req - The request object containing the comment ID and updated content.
 * @param {Response} res - The response object used to send the response.
 * @param {NextFunction} next - The middleware function to pass control to the next handler.
 * @throws {ApiError} Throws an error if user is not found, comment is not found, or content is missing.
 * @returns {Promise<void>} Sends a response with the updated comment.
 */

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

/**
 * Deletes a comment.
 * @param {MyUserRequest} req - The request object containing the comment ID.
 * @param {Response} res - The response object used to send the response.
 * @param {NextFunction} next - The middleware function to pass control to the next handler.
 * @throws {ApiError} Throws an error if user is not found or comment is not found.
 * @returns {Promise<void>} Sends a response indicating successful deletion.
 */

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