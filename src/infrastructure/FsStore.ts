import * as fs from "fs"
import { Definition, IDefinitionStore } from "../domain";

export class FsStore implements IDefinitionStore {
  private definitions: Definition[]

  constructor(private file: string) {
    const fileContent = fs.readFileSync(file).toString()
    this.definitions = JSON.parse(fileContent)
  }

  getDefinitionAsync(id: string): Promise<Definition> {
    const definition = this.definitions.find((def => def.id === id))
    if (!definition) {
      throw Error(`Not found: ${id}`)
    }
    return Promise.resolve(definition)
  }
  getDefinitionsAsync(): Promise<Definition[]> {
    return Promise.resolve(this.definitions)
  }
  async saveDefinitionAsync(definition: Definition): Promise<void> {
    this.definitions.push(definition)
    fs.writeFileSync(this.file, JSON.stringify(this.definitions))
  }

}