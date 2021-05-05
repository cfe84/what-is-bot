import * as should from "should"
import * as td from "testdouble"
import { Definition, DefinitionSearcher } from "../src/domain"

describe("Definition search", () => {
  // given
  const definitions: Definition[] = [
    {
      id: "1",
      definition: "This is the first definition",
      fullName: "Full name for the first definition",
      initialism: "abcd"
    },
    {
      id: "2",
      definition: "That is the second definition",
      fullName: "the other",
      initialism: "edfgh"
    }
  ]

  // when
  const searcher = new DefinitionSearcher(definitions)

  // then
  it("finds exact full name", () => {
    const res = searcher.searchDefinition("Full name for first")
    should(res).length(1)
    should(res[0].id).eql("1")
  })

  it("finds partial full name", () => {
    const res = searcher.searchDefinition("definition")
    should(res).length(2)
  })

  it("finds nothing", () => {
    const res = searcher.searchDefinition("sdlfkfd;kg;lfg")
    should(res).length(0)
  })

  it.skip("finds partial initialism", () => {
    const res = searcher.searchDefinition("ABC")
    should(res).length(1)
    should(res[0].id).eql("1")
  })

  it("finds with natural query", () => {
    const res = searcher.searchDefinition("What is the full name?")
    should(res).length(1)
    should(res[0].id).eql("1")
  })

})


