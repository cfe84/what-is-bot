import path = require("path");
import fs = require("fs");
import { IDictionary } from "../domain";
import { DictionaryMetadata } from "../domain/DictionaryMetadata";
import { ITenantStore } from "../domain/ITenantStore";
import { FsDictionaryStore } from "./FsDictionaryStore";
import { Tenant } from "../domain/Tenant";
import { IUserPreferenceStore } from "../domain/IUserPreferenceStore";
import { UserPreferences } from "../domain/UserPreferences";

export class FsStore implements ITenantStore, IUserPreferenceStore {
  private dictionaries: Map<string, IDictionary> = new Map()
  constructor(private path: string) {
  }

  async getDictionaryAsync(dictionaryId: string): Promise<IDictionary> {
    const file = path.join(this.path, `definitions-${dictionaryId}.csv`)
    if (!this.dictionaries.has(file)) {
      this.dictionaries.set(file, new FsDictionaryStore(file, dictionaryId))
    }
    return this.dictionaries.get(file) as IDictionary
  }

  async listDictionariesAsync(tenantId: string): Promise<DictionaryMetadata[]> {
    const record = this.getTenantRecord(tenantId)
    return Object.values(record.dictionaries)
  }

  async updateOrCreateDictionaryAsync(tenantId: string, metadata: DictionaryMetadata): Promise<void> {
    const record = this.getTenantRecord(tenantId)
    record.dictionaries[metadata.id] = metadata
    this.saveTenantRecord(record)
  }
  private saveTenantRecord(record: Tenant) {
    const file = this.getTenantFileName(record.tenantId)
    const content = JSON.stringify(record)
    fs.writeFileSync(file, content)
  }

  private getTenantRecord(tenantId: string): Tenant {
    const file = this.getTenantFileName(tenantId)
    if (!fs.existsSync(file)) {
      const defaultDictionary: DictionaryMetadata = {
        id: tenantId,
        isDefault: true,
        name: "Default"
      }
      const record: Tenant = {
        tenantId,
        dictionaries: {}
      }
      record.dictionaries[tenantId] = defaultDictionary
      return record
    }
    const record = JSON.parse(`${fs.readFileSync(file)}`) as Tenant
    return record
  }

  private getTenantFileName(tenantId: string): string {
    return path.join(this.path, `tenant-${tenantId}.json`)
  }

  async getDictionaryIdsAsync(userId: string): Promise<string[]> {
    const userRecord = this.getUserRecord(userId)
    return userRecord.dictionaries
  }

  async saveDictionaryIdsAsync(userId: string, ids: string[]): Promise<void> {
    const userRecord = this.getUserRecord(userId)
    userRecord.dictionaries = ids
    this.saveUserRecord(userRecord)
  }

  private saveUserRecord(record: UserPreferences) {
    const file = this.getUserFileName(record.userId)
    const content = JSON.stringify(record)
    fs.writeFileSync(file, content)
  }

  private getUserRecord(userId: string): UserPreferences {
    const file = this.getUserFileName(userId)
    if (!fs.existsSync(file)) {
      const record: UserPreferences = {
        userId,
        dictionaries: []
      }
      return record
    }
    const record = JSON.parse(`${fs.readFileSync(file)}`) as UserPreferences
    return record
  }

  private getUserFileName(userId: string): string {
    return path.join(this.path, `user-${userId}.json`)
  }
}