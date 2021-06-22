const stemmer = require("stemmer")
import { Definition } from "."

const ignoredWords = [
  "the",
  "what",
  "whats",
  "is",
  "mean"
]

interface WeightedDefinition {
  weight: number
  definition: Definition
}

interface CustomIndex {
  [stemmedTerm: string]: WeightedDefinition[]
}

interface weightedSearchResults {
  [definitionId: string]: WeightedDefinition
}

export class DefinitionSearcher {
  private index: CustomIndex = {}

  constructor(definitions: Definition[]) {
    definitions.forEach(this.addDefinition.bind(this))
  }

  private addTerm(definition: Definition, term: string, weight: number) {
    if (!this.index[term]) {
      this.index[term] = []
    }
    this.index[term].push({ definition, weight })
  }

  private clean(str: string): string[] {
    const forbiddenChars = /[^0-9a-z ]/ig
    return str.replace(forbiddenChars, "")
      .split(" ")
      .map(word => stemmer(word))
      .map(word => word.toLowerCase())
  }

  private addDefinition(definition: Definition) {
    const cleanedName = this.clean(definition.fullName)
    const cleanedDef = this.clean(definition.definition)
    const cleanedAcronym = this.clean(definition.initialism || "")
    const addTerms = (terms: string[], weight: number) =>
      terms.forEach((term: string) => this.addTerm(definition, term, weight))
    addTerms(cleanedName, 5)
    addTerms(cleanedDef, 1)
    addTerms(cleanedAcronym, 10)
  }

  private searchTerm(term: string): WeightedDefinition[] {
    const cleaned = this.clean(term)
    return cleaned
      .map(term => this.index[term])
      .filter(res => res !== undefined)
      .reduce((res, cur) => [...res, ...cur], [])
  }

  private removeIgnoredTerms(terms: string[]) {
    return terms.filter(term => ignoredWords.indexOf(term) < 0)
  }

  searchDefinition(query: string): Definition[] {
    const terms = this.removeIgnoredTerms(this.clean(query))
    const res: weightedSearchResults = {}
    terms.forEach(term => {
      const weightedDefinitions = this.searchTerm(term)
      weightedDefinitions.forEach(weightedDefinition => {
        if (!res[weightedDefinition.definition.id]) {
          res[weightedDefinition.definition.id] = {
            definition: weightedDefinition.definition,
            weight: weightedDefinition.weight
          }
        } else {
          res[weightedDefinition.definition.id].weight += weightedDefinition.weight
        }
      })
    })
    return Object.values(res)
      .sort((a, b) => a.weight - b.weight)
      .map(weightedDefinition => weightedDefinition.definition)
  }
}