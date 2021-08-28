import { IDictionary, Definition } from "../domain";
import { DictionaryMetadata } from "../domain/DictionaryMetadata";
import { ITenantStore } from "../domain/ITenantStore";
import { IUserPreferenceStore } from "../domain/IUserPreferenceStore";
import { Tenant } from "../domain/Tenant";

export class MemoryStore implements IUserPreferenceStore, ITenantStore {
  private tenants: Map<string, Tenant> = new Map()
  private dictionaries: Map<string, IDictionary> = new Map()
  async listDictionariesAsync(tenantId: string): Promise<DictionaryMetadata[]> {
    const tenant = this.tenants.get(tenantId)
    if (!tenant) {
      return []
    }
    return Object.values(tenant.dictionaries)
  }

  async getDictionaryAsync(dictionaryId: string): Promise<IDictionary> {
    if (!this.dictionaries.has(dictionaryId)) {
      this.dictionaries.set(dictionaryId, new MemoryDictionaryStore())
    }
    return this.dictionaries.get(dictionaryId) as MemoryDictionaryStore

  }
  async updateOrCreateDictionaryAsync(tenantId: string, metadata: DictionaryMetadata): Promise<void> {
    let tenant = this.tenants.get(tenantId)
    if (!tenant) {
      tenant = {
        tenantId,
        dictionaries: {}
      }
    }
    tenant.dictionaries[metadata.id] = metadata
    this.tenants.set(tenantId, tenant)
  }
  private userPreferenceStore: Map<string, string[]> = new Map()
  async getDictionaryIdsAsync(userId: string): Promise<string[]> {
    return this.userPreferenceStore.get(userId) || []
  }
  async saveDictionaryIdsAsync(userId: string, ids: string[]): Promise<void> {
    this.userPreferenceStore.set(userId, ids)
  }
}

export class MemoryDictionaryStore implements IDictionary {
  getDefinitionsAsync(): Promise<Definition[]> {
    return Promise.resolve(Object.keys(this.definitionStore).map(key => this.definitionStore[key]));
  }

  private definitionStore: { [id: string]: Definition } = {
  }

  getDefinitionAsync(id: string): Promise<Definition> {
    return Promise.resolve(this.definitionStore[id])
  }
  saveDefinitionAsync(thing: Definition): Promise<void> {
    this.definitionStore[thing.id] = thing
    return Promise.resolve()
  }
}