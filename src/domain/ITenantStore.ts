import { DictionaryMetadata } from "./DictionaryMetadata";
import { IDictionary } from "./IDictionary";

export interface ITenantStore {
  listDictionariesAsync(tenantId: string): Promise<DictionaryMetadata[]>
  getDictionaryAsync(dictionaryId: string): Promise<IDictionary>
  updateOrCreateDictionaryAsync(tenantId: string, metadata: DictionaryMetadata): Promise<void>
}