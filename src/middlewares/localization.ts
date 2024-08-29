/* eslint-disable max-len */
import { Request,Response,NextFunction } from 'express';

import i18n, { Languages,ACCEPT_LANGUAGES } from '../utils/intl/i18n-config';
import {LocaleService} from '../utils/intl/locale-service';

const localeService = new LocaleService(i18n);

const localizationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const acceptLanguage = req.query.lang as string || req.headers['accept-language'] || 'en';

  if (!ACCEPT_LANGUAGES.includes(acceptLanguage)) {
    localeService.setLocale(Languages.ENGLISH);
  } else {
    localeService.setLocale(acceptLanguage);
  }

  req.localeService = localeService;
  next();
};

export default localizationMiddleware;