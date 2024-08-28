import bcrypt from 'bcrypt';
import { Request,Response,NextFunction } from 'express';
import {Op} from 'sequelize';

import db from '../sequelize-client';
import ApiError from '../utils/api-error';
import ApiResponse from '../utils/api-response';
import asyncHandler from '../utils/async-handler';
import encryption from '../utils/encryption';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt-tokens';

// import { MyUserRequest } from '../types/request-interface';

// export interface MyUserRequest extends Request{
//     token?: string;
//     user?:User;
// }

export const registerUser = asyncHandler(
  async (req:Request,res:Response,next:NextFunction)=>{
    const {userName,email,password} = req.body;
    if(!userName || !email || !password){
      return next(new ApiError(400,'All Fields Required'));
    }

    try {
      const existingUser = await db.User.findOne({
        where:{
          [Op.or]:[{email},{userName}],
        },
      });

      if(existingUser){
        return next(new ApiError(400,'Email or Username already exists'));
      }

      const newUser = await db.User.create({
        userName,
        email,
        password,
      });

      const response = new ApiResponse(
        201,
        newUser,
        'User Registered Successfully'
      );
      res.status(201).json(response);

    } catch (error) {
      console.log(error);
      return next(
        new ApiError(500,'Internal Server Error',[error])
      );
    }
  }
);

export const loginUser = asyncHandler(
  async (req:Request,res:Response,next:NextFunction)=>{
    const {email,password} = req.body;
    if(!email ||!password){
      return next(new ApiError(400,'All Fields Required'));
    }

    try{
      const user = await db.User.findOne({where:{email}});
      if(!user){
        return next(new ApiError(404,'User Not Found'));
      }

      const isMatch = await bcrypt.compare(password,user.password);
      if(!isMatch){
        return next(new ApiError(401,'Invalid Credentials'));
      }

      const accessToken = generateAccessToken({
        userId: user.id,
        email: user.email,
      });
      const encryptedAccessToken = encryption.encryptWithAES(accessToken);

      const existingAccessToken = await db.AccessToken.findOne({
        where: {
          userId: user.id,
          tokenType: 'ACCESS',
        },
      });
      if (existingAccessToken) {
        await db.AccessToken.destroy({
          where: {
            id: existingAccessToken.id,
          },
        });
      }

      await db.AccessToken.create({
        tokenType: 'ACCESS',
        token: encryptedAccessToken,
        userId: user.id,
        expiredAt: new Date(Date.now() + 3 * 60 * 60 * 1000),
      });

      let refreshTokenRecord = await db.AccessToken.findOne({
        where: {
          userId: user.id,
          tokenType: 'REFRESH',
        },
      });

      let refreshToken: string;

      if (!refreshTokenRecord) {
        refreshToken = generateRefreshToken({
          userId: user.id,
          email: user.email,
        });
        const encryptedRefreshToken =
                    encryption.encryptWithAES(refreshToken);

        refreshTokenRecord = await db.AccessToken.create({
          tokenType: 'REFRESH',
          token: encryptedRefreshToken,
          userId: user.id,
          expiredAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
      } else {
        refreshToken = encryption.decryptWithAES(
          refreshTokenRecord.token,
        );
      }

      const response = new ApiResponse(
        201,
        {
          accessToken,
          refreshToken,
          user,
        },
        'Login Successfully',
      );

      res.status(200).json(response);
    }catch(error){
      console.log(error);
      return next(
        new ApiError(500,'Internal Server Error',[error])
      );
    }
  }
);