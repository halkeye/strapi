import type { Strapi } from '@strapi/types';

import { addDocumentMiddlewares } from './middlewares/documentation';

export async function register({ strapi }: { strapi: Strapi }) {
  await addDocumentMiddlewares({ strapi });
}
