import { Definition } from ".";

export class DefinitionSearcher {
  constructor(private definitions: Definition[]) { }

  searchDefinition(term: string): Definition[] {
    term = term.trim().toLowerCase()
    const match = (definition: Definition) =>
      definition.fullName.toLowerCase().indexOf(term) >= 0
      || (definition.initialism && definition.initialism.toLowerCase().indexOf(term) >= 0)
    const res = this.definitions.filter(match)
    return res
  }
}