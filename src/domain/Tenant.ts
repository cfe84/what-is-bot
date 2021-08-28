import { DictionaryMetadata } from "./DictionaryMetadata";

export interface Tenant {
  tenantId: string,
  dictionaries: { [key: string]: DictionaryMetadata }
}