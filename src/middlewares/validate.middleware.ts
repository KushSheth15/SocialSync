import { Request, Response, NextFunction } from 'express';
import { ObjectSchema } from 'joi';

import ApiError from '../utils/api-error';

const validate = (schema: ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    if (error) {
      const messages = error.details
        .map(detail => detail.message)
        .join(', ');
      return next(new ApiError(400, `Validation error: ${messages}`));
    }
    next();
  };
};

export default validate;
