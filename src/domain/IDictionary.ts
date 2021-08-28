import { Definition } from ".";

export interface IDictionary {
  getDefinitionAsync(id: string): Promise<Definition>
  getDefinitionsAsync(): Promise<Definition[]>
  saveDefinitionAsync(definition: Definition): Promise<void>
}