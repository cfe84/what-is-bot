import { v4 as uuidv4 } from "uuid"
import { ActivityFactory, ContactRelationUpdateActionTypes, InvokeResponse, TeamInfo, TeamsChannelAccount, TurnContext } from "botbuilder-core";
import { MessageFactory, TeamsActivityHandler, CardFactory, TeamsInfo, Attachment } from 'botbuilder';
import { IDefinitionStore, Definition, DefinitionSearcher, ILogger } from "../domain";
import * as helpCard from "./cards/helpCard.json"
import { editDefinitionCard } from "./cards/editDefinitionCard"
import { definitionCreatedConfirmation } from "./cards/definitionCreatedConfirmation";
import { noDefinitionFoundCard } from "./cards/noDefinitionFoundCard";

export interface BotActivityHandlerDependencies {
    definitionStore: IDefinitionStore,
    logger: ILogger
}

const ARGUMENTNAME_FULL_NAME = "fullName"
const ARGUMENTNAME_DEFINITION = "definition"
const ARGUMENTNAME_INITIALISM = "initialism"
const ARGUMENTNAME_URL = "url"
const ACTIONNAME_HELP = "help"
const ACTIONNAME_NEW_DEFINITION = "new definition"
const ACTIONNAME_CREATE_DEFINITION = "create definition"

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
                await this.helpActivityAsync(context);
                break;
            case ACTIONNAME_NEW_DEFINITION:
                await this.showNewDefinitionFormAsync(context);
                break;
            case ACTIONNAME_CREATE_DEFINITION:
                await this.createDefinitionAsync(context);
                break;
            default:
                await this.searchAsync(context);
        }
        await nextAsync();
    }

    private async showCard(cardContent: any, context: TurnContext) {
        const card = CardFactory.adaptiveCard(cardContent)
        await context.sendActivity({ attachments: [card] });
    }

    private async helpActivityAsync(context: TurnContext) {
        await this.showCard(helpCard, context)
    }

    private async showNewDefinitionFormAsync(context: TurnContext) {
        const fullName = context.activity.value ? context.activity.value["fullName"] || "" : ""
        const definition: Definition = {
            definition: "",
            fullName,
            id: "",
            initialism: "",
            url: ""
        }
        const card = editDefinitionCard(undefined)
        await this.showCard(card, context)
    }

    private async createDefinitionAsync(context: TurnContext) {
        const fullName = context.activity.value[ARGUMENTNAME_FULL_NAME]
        const definition = context.activity.value[ARGUMENTNAME_DEFINITION]
        const url = context.activity.value[ARGUMENTNAME_URL]
        const initialism = context.activity.value[ARGUMENTNAME_INITIALISM]
        const id = uuidv4()

        const def: Definition = {
            id,
            fullName,
            definition,
            url,
            initialism
        }
        await this.deps.definitionStore.saveDefinitionAsync(def)

        const card = CardFactory.adaptiveCard(definitionCreatedConfirmation(def));
        await context.sendActivity({ attachments: [card] });
    }

    private async searchAsync(context: TurnContext): Promise<void> {
        const definitions = await this.deps.definitionStore.getDefinitionsAsync()
        const search = new DefinitionSearcher(definitions)
        const matching = search.searchDefinition(context.activity.text)
        if (!matching || matching.length === 0) {
            const card = CardFactory.adaptiveCard(noDefinitionFoundCard(context.activity.text))
            await context.sendActivity({ attachments: [card] })
        } else {
            const assembleMessage = (definition: Definition) =>
                `- **${definition.fullName}**` +
                (definition.initialism ? ` (${definition.initialism})` : "") +
                `: ${definition.definition}.` +
                (definition.url ? ` [Learn more](${definition.url}).` : "")
            await context.sendActivity(`Here is what I found:\n` + matching.map((match) => assembleMessage(match)).join("\n"))
        }
    }
}