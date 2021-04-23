import { IDefinitionStore, Definition } from "../domain";

export class MemoryStore implements IDefinitionStore {
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