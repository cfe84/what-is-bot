import { Definition } from ".";

export interface IDefinitionStore {
  getDefinitionAsync(id: string): Promise<Definition>
  getDefinitionsAsync(): Promise<Definition[]>
  saveDefinitionAsync(definition: Definition): Promise<void>
}