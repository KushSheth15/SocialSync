import { Request } from 'express';

import User from '../models/user.model';
import {LocaleService} from '../utils/intl/locale-service';

export interface MyUserRequest extends Request {
    token?:string;
    user?:User;
}

declare global {
    namespace Express {
      interface Request {
        localeService?: LocaleService;
      }
    }
  }