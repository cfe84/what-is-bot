import * as td from "testdouble"
import * as should from "should"

import { MemoryStore } from "../src/infrastructure/MemoryStore"
import { BotActivityHandler, BotActivityHandlerDependencies } from "../src/infrastructure/BotActivityHandler"
import { Attachment, TurnContext } from "botbuilder-core"

import { makeTurnContext } from "./makeTurnContext"
import { Activity } from "botbuilder"

type StringObject = { [key: string]: any }

const makeDepsAsync = async (): Promise<BotActivityHandlerDependencies> => {
  const definitionStore = new MemoryStore()
  await definitionStore.saveDefinitionAsync({
    definition: "DEFINITION",
    fullName: "FULL NAME",
    id: "ID",
    initialism: "INITIALISM",
    url: "URL"
  })
  return {
    definitionStore,
    logger: td.object(["log", "warn", "error", "debug"])
  }
}

// then
const checkCardText = (cardTextBlock: string) => (activity: Partial<Activity>) => {
  should(activity.attachments).has.length(1)
  const card = (activity.attachments as Attachment[])[0]
  should(card.contentType).eql('application/vnd.microsoft.card.adaptive')
  const content: any = card.content
  should(content.body.find((elt: any) => elt.type === "TextBlock" && elt.text.indexOf(cardTextBlock) >= 0))
    .not.be.undefined()
  return true
}

const findElement = (inObject: { [key: string]: any }, matching: (object: StringObject) => boolean) => {
  if (matching(inObject)) {
    return true
  }
  const keys = Object.keys(inObject)
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    const element = inObject[key]
    if (typeof (element) === "object") {
      if (Array.isArray(element)) {
        for (let j = 0; j < element.length; j++) {
          if (findElement(element[j], matching)) {
            return true
          }
        }
      } else {
        if (findElement(element, matching)) {
          return true
        }
      }
    }
  }
  return false
}

async function testBotAsync(label: string, text: string, checkResult: (card: any) => boolean, values?: { [key: string]: string }) {
  // given
  const deps = await makeDepsAsync()
  const handler = new BotActivityHandler(deps)
  const context = makeTurnContext(text, values)

  // when
  try {
    await handler.run(context)
  } catch (er) {
    it("failed on invoke for " + text, () => { throw er })
    return
  }

  it(label, function () { td.verify(context.sendActivity(td.matchers.argThat(checkResult))) })
}

describe("Bot activity handler", async () => {
  await testBotAsync("Help form", "help", checkCardText("definitions"))
  await testBotAsync("New definition form", "new definition", checkCardText("Create definition"))
  await testBotAsync("Finds definition", "INITIALISM", (card: any): boolean => {
    should(findElement(card, (elt: StringObject) => elt["type"] === "TextBlock" && elt["text"] && elt["text"].indexOf("Here is what I found") >= 0)).be.true()
    should(findElement(card, (elt: StringObject) => elt["text"] && elt["text"].indexOf("INITIALISM") >= 0)).be.true()
    should(findElement(card, (elt: StringObject) => elt["text"] === "edit definition" && elt["id"] === "ID")).be.true()
    return true
  })
  await testBotAsync("Does not find definition", "bloop", (activity: Partial<Activity>): boolean => {
    checkCardText("bloop")(activity)
    checkCardText("didn't")(activity)
    return true
  })

  context("Create definition", async () => {
    // given
    const deps = await makeDepsAsync()
    const handler = new BotActivityHandler(deps)
    const context = makeTurnContext("create definition", {
      fullName: "THE_NEW_FULLNAME",
      initialism: "THE_NEW_INITIALISM",
      definition: "THE_NEW_DEFINITION",
      url: "THE_NEW_URL"
    })

    // when
    try {
      await handler.run(context)
    } catch (er) {
      it("failed on invoke for create definition", () => { throw er })
      return
    }

    it("Creates definition", function () {
      td.verify(context.sendActivity(td.matchers.argThat((activity: Partial<Activity>): boolean => {
        checkCardText("Created definition for")(activity)
        checkCardText("THE_NEW_FULLNAME")(activity)
        return true
      })))
    })

    it("Finds definition in the list", async () => {
      const definitions = await deps.definitionStore.getDefinitionsAsync()
      should(definitions[1].fullName).eql("THE_NEW_FULLNAME")
    })
  })

  context("Update definition", async () => {
    // given
    const deps = await makeDepsAsync()
    const handler = new BotActivityHandler(deps)
    const context = makeTurnContext("update definition", {
      fullName: "THE_NEW_FULLNAME",
      initialism: "THE_NEW_INITIALISM",
      definition: "THE_NEW_DEFINITION",
      url: "THE_NEW_URL",
      id: "ID"
    })

    // when
    try {
      await handler.run(context)
    } catch (er) {
      it("failed on invoke for update definition", () => { throw er })
      return
    }

    it("Confirmed update", function () {
      td.verify(context.sendActivity(td.matchers.argThat((activity: Partial<Activity>): boolean => {
        checkCardText("Updated definition for")(activity)
        checkCardText("THE_NEW_FULLNAME")(activity)
        return true
      })))
    })

    it("Finds definition in the list", async () => {
      const definitions = await deps.definitionStore.getDefinitionsAsync()
      should(definitions).length(1)
      should(definitions[0].fullName).eql("THE_NEW_FULLNAME")
    })
  })

})