import { Index } from "lunr"
import lunr = require("lunr")
import { Definition } from "."

export class DefinitionSearcher {
  private index: Index
  constructor(private definitions: Definition[]) {
    this.index = lunr(function () {
      this.ref("id")
      this.field("fullName", { boost: 5 })
      this.field("initialism", { boost: 10 })
      this.field("definition", { boost: 1 })
      this.pipeline.add(lunr.trimmer)
      this.pipeline.add(lunr.stemmer)
      this.searchPipeline.add(lunr.stemmer)
      definitions.forEach(definition => this.add(definition), this)
    })
  }

  searchDefinition(term: string): Definition[] {
    const lunrRes = this.index.search(term)
    const res = lunrRes
      .sort((a, b) => a.score - b.score)
      .map(res => {
        return this.definitions.find(def => def.id === res.ref) as Definition
      })
    return res
  }
}