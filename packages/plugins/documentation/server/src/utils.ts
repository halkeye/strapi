import type { Strapi } from '@strapi/types';

import type { Services } from './services';

export const getService = <TName extends keyof Services>(
  name: TName,
  { strapi }: { strapi: Strapi } = { strapi: global.strapi }
): Services[TName] => {
  return strapi.plugin('documentation').service<Services[TName]>(name);
};

export default {
  getService,
};
