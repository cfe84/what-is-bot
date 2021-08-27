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
    const res2 = searcher.searchDefinition("other")
    should(res2).length(1)
    should(res2[0].id).eql("2")
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

  it("finds with punctuation", () => {
    const res = searcher.searchDefinition("other?")
    should(res).length(1)
    should(res[0].id).eql("2")
  })

  it("finds with word salad", () => {
    const res = searcher.searchDefinition("What is other?")
    const res2 = searcher.searchDefinition("what's other?")
    should(res).length(1)
    should(res2).length(1)
    should(res[0].id).eql("2")
    should(res2[0].id).eql("2")
  })

  it("finds orders partial results", () => {
    const res = searcher.searchDefinition("second definition")
    should(res[0].id).eql("2")
    should(res[1].id).eql("1")
  })
})


