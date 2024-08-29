import path from 'path';

import i18n from 'i18n';

export const ACCEPT_LANGUAGES = ['en','es'];

export const Languages = {
  ENGLISH:'en',
  SPANISH:'es'
};

i18n.configure({
  locales: ACCEPT_LANGUAGES,
  defaultLocale: Languages.ENGLISH,
  queryParameter:'lang',
  directory:path.join(__dirname,'./locales'),
  api:{
    __:'translate',
    _n:'translateN'
  },
});

export default i18n;