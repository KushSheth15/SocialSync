import { Request } from 'express';

import User from '../models/user.model';

export interface MyUserRequest extends Request {
    token?:string;
    user?:User;
}