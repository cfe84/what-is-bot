import { v4 as uuidv4 } from "uuid"
import { ActivityFactory, ContactRelationUpdateActionTypes, InvokeResponse, TeamInfo, TeamsChannelAccount, TurnContext } from "botbuilder-core";
import { MessageFactory, TeamsActivityHandler, CardFactory, TeamsInfo, Attachment } from 'botbuilder';
import { IDefinitionStore, Definition, DefinitionSearcher, ILogger } from "../domain";
import * as helpCard from "./cards/helpCard.json"
import { editDefinitionCard } from "./cards/editDefinitionCard"
import { definitionCreatedConfirmation } from "./cards/definitionCreatedConfirmation";
import { noDefinitionFoundCard } from "./cards/noDefinitionFoundCard";
import { definitionsCard } from "./cards/definitionsCard";

export interface BotActivityHandlerDependencies {
    definitionStore: IDefinitionStore,
    logger: ILogger
}

const ARGUMENTNAME_FULL_NAME = "fullName"
const ARGUMENTNAME_DEFINITION = "definition"
const ARGUMENTNAME_INITIALISM = "initialism"
const ARGUMENTNAME_URL = "url"
const ARGUMENTNAME_ID = "id"
const ACTIONNAME_HELP = "help"
const ACTIONNAME_NEW_DEFINITION = "new definition"
const ACTIONNAME_CREATE_DEFINITION = "create definition"
const ACTIONNAME_EDIT_DEFINITION = "edit definition"
const ACTIONNAME_UPDATE_DEFINITION = "update definition"
const ACTIONNAME_LIST_DEFINITIONS = "list definitions"

export class BotActivityHandler extends TeamsActivityHandler {
    constructor(private deps: BotActivityHandlerDependencies) {
        super();
        this.onMessage(async (context, next) => await this.handleMessagesAsync(context, next));
    }

    public async handleMessagesAsync(context: TurnContext, nextAsync: () => Promise<void>) {
        TurnContext.removeRecipientMention(context.activity);
        if (!context.activity.text && (!context.activity.value || !context.activity.value["text"])) {
            this.deps.logger.debug(JSON.stringify(context, null, 2))
            await this.helpActivityAsync(context)
            return
        }
        switch ((context.activity.text || context.activity.value["text"]).trim().toLowerCase()) {
            case ACTIONNAME_HELP:
                await this.helpActivityAsync(context)
                break
            case ACTIONNAME_NEW_DEFINITION:
                await this.showNewDefinitionFormAsync(context)
                break
            case ACTIONNAME_CREATE_DEFINITION:
            case ACTIONNAME_UPDATE_DEFINITION:
                await this.saveDefinitionAsync(context)
                break
            case ACTIONNAME_EDIT_DEFINITION:
                await this.showEditDefinitionFormAsync(context)
                break
            case ACTIONNAME_LIST_DEFINITIONS:
                await this.listDefinitionsAsync(context)
                break
            default:
                await this.searchAsync(context);
        }
        await nextAsync();
    }
    async listDefinitionsAsync(context: TurnContext) {
        const definitions = await this.deps.definitionStore.getDefinitionsAsync()
        const card = definitionsCard(definitions.sort((a, b) => a.fullName.localeCompare(b.fullName)))
        await this.showCard(card, context)
    }

    private async showCard(cardContent: any, context: TurnContext) {
        const card = CardFactory.adaptiveCard(cardContent)
        await context.sendActivity({ attachments: [card] });
    }

    private async helpActivityAsync(context: TurnContext) {
        await this.showCard(helpCard, context)
    }

    private cleanTerm(term: string): string {
        const forbiddenChars = /[^0-9a-z ]/ig
        term = term.replace(forbiddenChars, "")
        return term
    }

    private async showNewDefinitionFormAsync(context: TurnContext) {
        const fullName = context.activity.value
            ? this.cleanTerm(context.activity.value["fullName"] || "")
            : ""
        const definition: Definition = {
            definition: "",
            fullName,
            id: "",
            initialism: "",
            url: ""
        }
        const card = editDefinitionCard(definition)
        await this.showCard(card, context)
    }

    private async saveDefinitionAsync(context: TurnContext) {
        const fullName = context.activity.value[ARGUMENTNAME_FULL_NAME]
        const definition = context.activity.value[ARGUMENTNAME_DEFINITION]
        const url = context.activity.value[ARGUMENTNAME_URL]
        const initialism = context.activity.value[ARGUMENTNAME_INITIALISM]
        const isUpdate = !!context.activity.value[ARGUMENTNAME_ID]
        const id = isUpdate ? context.activity.value[ARGUMENTNAME_ID] : uuidv4()

        const def: Definition = {
            id,
            fullName,
            definition,
            url,
            initialism
        }
        await this.deps.definitionStore.saveDefinitionAsync(def)

        const card = CardFactory.adaptiveCard(definitionCreatedConfirmation(def, isUpdate));
        await context.sendActivity({ attachments: [card] });
    }

    private async showEditDefinitionFormAsync(context: TurnContext) {
        const id = context.activity.value ? (context.activity.value["id"] || "") : ""
        const definition = await this.deps.definitionStore.getDefinitionAsync(id)
        const card = editDefinitionCard(definition)
        await this.showCard(card, context)
    }

    private async searchAsync(context: TurnContext): Promise<void> {
        const definitions = await this.deps.definitionStore.getDefinitionsAsync()
        const search = new DefinitionSearcher(definitions)
        const matching = search.searchDefinition(context.activity.text)
        if (!matching || matching.length === 0) {
            const card = CardFactory.adaptiveCard(noDefinitionFoundCard(context.activity.text))
            await context.sendActivity({ attachments: [card] })
        } else {
            const card = CardFactory.adaptiveCard(definitionsCard(matching))
            await context.sendActivity({ attachments: [card] })
        }
    }
}