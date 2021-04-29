import * as fs from "fs"
import * as parse from "csv-parse/lib/sync"
import { Definition, IDefinitionStore } from "../domain";

enum FileTypeEnum {
  CSV,
  JSON,
  Unknown
}

export class FsStore implements IDefinitionStore {
  private definitions: Definition[]
  private fileType: FileTypeEnum

  constructor(private file: string) {
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

  private toCsv(definitions: Definition[]) {
    const escape = (str: string) => str.replace(/\"/g, '""')
    const titles = `id,initialism,fullName,definition,url\n`
    const defs = definitions.map(definition =>
      [definition.id, definition.initialism, definition.fullName, definition.definition, definition.url]
        .map(str => str ? `"${escape(str)}"` : "")
        .join(",")
    )
    const res = [titles, ...defs].join("\n")
    return res
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
      content = this.toCsv(definitions)
    }
    fs.writeFileSync(fileName, content)
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
    this.saveFile(this.fileType, this.file, this.definitions)
  }

}