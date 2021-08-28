import { CardFactory, ComponentRegistration, InvokeResponse, MessageFactory, TeamsInfo, TurnContext } from "botbuilder"
import { v4 as uuidv4 } from "uuid"
import { Definition } from "../../domain"
import { BotActivityHandlerDependencies } from "../BotActivityHandler"
import { definitionsCard } from "../cards/definitionsCard"
import { editDefinitionCard, editDefinitionPlaceholder, editDefinitionPlaceholderWithRefresh } from "../cards/editDefinitionCard"

const ARGUMENTNAME_FULL_NAME = "fullName"
const ARGUMENTNAME_DEFINITION = "definition"
const ARGUMENTNAME_INITIALISM = "initialism"
const ARGUMENTNAME_URL = "url"
const ARGUMENTNAME_ID = "id"
const ARGUMENTNAME_DICTIONARYID = "dictionaryId"

export class EditionHandler {

  constructor(private deps: BotActivityHandlerDependencies) { }

  async saveDefinitionAsync(context: TurnContext) {
    const fullName = context.activity.value[ARGUMENTNAME_FULL_NAME]
    const definition = context.activity.value[ARGUMENTNAME_DEFINITION]
    const url = context.activity.value[ARGUMENTNAME_URL]
    const initialism = context.activity.value[ARGUMENTNAME_INITIALISM]
    const isUpdate = !!context.activity.value[ARGUMENTNAME_ID]
    const id = isUpdate ? context.activity.value[ARGUMENTNAME_ID] : uuidv4()
    const dictionaryId = isUpdate ? context.activity.value[ARGUMENTNAME_DICTIONARYID] : context.activity.conversation.tenantId || "default"
    const tenantId = context.activity.conversation.tenantId || "default"

    const def: Definition = {
      id,
      fullName,
      definition,
      url,
      initialism,
      dictionaryId
    }
    const dictionary = await this.deps.tenantStore.getDictionaryAsync(dictionaryId)
    await dictionary.saveDefinitionAsync(def)

    const definitionCard = CardFactory.adaptiveCard(definitionsCard(fullName, [def]))
    const message = MessageFactory.attachment(definitionCard)
    message.id = context.activity.replyToId
    await context.updateActivity(message);
  }

  async showNewDefinitionFormAsync(context: TurnContext) {
    this.deps.logger.debug("Load new definition refresh card")
    const initialism = context.activity.value
      ? this.cleanTerm(context.activity.value["fullName"] || "")
      : ""
    const dictionaryId = context.activity.conversation.tenantId || "default"
    const definition: Definition = {
      definition: "",
      fullName: "",
      id: "",
      initialism,
      url: "",
      dictionaryId
    }

    await this.sendDefinitionRefreshCardAsync(context, definition)
  }

  private async sendDefinitionRefreshCardAsync(context: TurnContext, definition: Definition) {
    const userId = context.activity.from.id
    const userName = context.activity.from.name
    const users = (await TeamsInfo.getMembers(context)).map(user => user.id)
    const cardContent = editDefinitionPlaceholderWithRefresh("new definition", definition, userId, users, userName)
    const card = CardFactory.adaptiveCard(cardContent)
    const activity = MessageFactory.attachment(card)
    activity.id = context.activity.replyToId
    await context.updateActivity(activity)
  }

  async handleEditDefinitionAsync(context: TurnContext): Promise<InvokeResponse> {
    this.deps.logger.debug("Refresh card for " + context.activity.from.name)
    const definition = context.activity.value.action.data.definition as Definition
    const initiatorId = context.activity.value.action.data.initiatorId
    const initiatorName = context.activity.value.action.data.initiatorName
    const callIsFromInitiator = context.activity.from.id === initiatorId
    const cardContent = callIsFromInitiator
      ? editDefinitionCard(definition)
      : editDefinitionPlaceholder(initiatorName, definition)
    return {
      status: 200,
      body: {
        statusCode: 200,
        type: "application/vnd.microsoft.card.adaptive",
        value: cardContent
      },
    };
  }

  async showEditDefinitionFormAsync(context: TurnContext) {
    const id = context.activity.value ? (context.activity.value["id"] || "") : ""
    const tenantId = context.activity.conversation.tenantId || "default"
    const dictionaryId = context.activity.value ? (context.activity.value["dictionaryId"] || tenantId) : tenantId
    const dictionary = await this.deps.tenantStore.getDictionaryAsync(dictionaryId)
    const definition = await dictionary.getDefinitionAsync(id)
    await this.sendDefinitionRefreshCardAsync(context, definition)
  }

  private cleanTerm(term: string): string {
    const forbiddenChars = /[^0-9a-z ]/ig
    term = term.replace(forbiddenChars, "")
    return term
  }
}