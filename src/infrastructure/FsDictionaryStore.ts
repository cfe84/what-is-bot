import * as fs from "fs"
import * as parse from "csv-parse/lib/sync"
import * as csv from "csv/lib/sync"
import { Definition, IDictionary } from "../domain";

enum FileTypeEnum {
  CSV,
  JSON,
  Unknown
}

export class FsDictionaryStore implements IDictionary {
  private definitions: Definition[]
  private fileType: FileTypeEnum

  constructor(private file: string, private dictionaryId: string) {
    this.fileType = this.determineFileTypeFromName(file)
    this.definitions = this.loadFile(this.fileType, file)
  }

  private determineFileTypeFromName(fileName: string): FileTypeEnum {
    if (fileName.endsWith("json")) {
      return FileTypeEnum.JSON
    }
    if (fileName.endsWith("csv")) {
      return FileTypeEnum.CSV
    }
    return FileTypeEnum.Unknown
  }

  private loadFile(fileType: FileTypeEnum, fileName: string): Definition[] {
    const fileContent = fs.readFileSync(fileName).toString()
    if (fileType === FileTypeEnum.JSON) {
      return JSON.parse(fileContent)
    }
    if (fileType === FileTypeEnum.CSV) {
      return parse(fileContent, {
        columns: true,
        skipEmptyLines: true
      })
    }
    throw Error("Unsupported filetype. Only csv and json are supported: " + fileName)
  }

  private saveFile(fileType: FileTypeEnum, fileName: string, definitions: Definition[]) {
    if (fileType === FileTypeEnum.Unknown) {
      throw Error("Unsupported filetype. Only csv and json are supported")
    }
    let content = ""
    if (fileType === FileTypeEnum.JSON) {
      content = JSON.stringify(definitions)
    }
    if (fileType === FileTypeEnum.CSV) {
      // content = this.toCsv(definitions)
      content = csv.stringify(definitions, { header: true })
    }
    fs.writeFileSync(fileName, content)
  }

  getDefinitionAsync(id: string): Promise<Definition> {
    const definition = this.definitions.find((def => def.id === id))
    if (!definition) {
      throw Error(`FsDictionaryStore.getDefinitionAsync: Definition not found: ${id} in dictionary ${this.dictionaryId}`)
    }
    definition.dictionaryId = this.dictionaryId
    return Promise.resolve(definition)
  }

  getDefinitionsAsync(): Promise<Definition[]> {
    return Promise.resolve(this.definitions.map(definition => {
      definition.dictionaryId = this.dictionaryId
      return definition
    }))
  }

  async saveDefinitionAsync(definition: Definition): Promise<void> {
    const idx = this.definitions.findIndex(def => def.id === definition.id)
    if (idx >= 0) {
      this.definitions.splice(idx, 1, definition)
    } else {
      this.definitions.push(definition)
    }
    this.saveFile(this.fileType, this.file, this.definitions)
  }

}