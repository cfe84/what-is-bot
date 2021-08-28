import { IDictionary } from "./IDictionary";

export interface IUserPreferenceStore {
  getDictionaryIdsAsync(userId: string): Promise<string[]>
  saveDictionaryIdsAsync(userId: string, ids: string[]): Promise<void>
}