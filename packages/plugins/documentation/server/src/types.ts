import type { Common, Schema } from '@strapi/types';
import type { OpenAPIV3 } from 'openapi-types';

export interface Config {
  restrictedAccess: boolean;
  password?: string;
}

export type PluginConfig = OpenAPIV3.Document & {
  info: OpenAPIV3.InfoObject & {
    'x-generation-date'?: string;
  };
  'x-strapi-config': {
    plugins: string[] | null;
    mutateDocumentation?: ((state: OpenAPIV3.Document) => OpenAPIV3.Document) | null;
  };
};

export interface ApiInfo {
  routeInfo: Common.Router;
  attributes: Schema.Attributes;
  uniqueName: string;
  contentTypeInfo: any;
  kind: string;
}

export interface Api {
  getter: string;
  name: string;
  ctNames: string[];
}
