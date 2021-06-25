import { TurnContext } from "botbuilder-core";
import { TeamsActivityHandler, CardFactory, InvokeResponse } from 'botbuilder';
import { IDefinitionStore, DefinitionSearcher, ILogger } from "../domain";
import * as helpCard from "./cards/helpCard.json"
import { noDefinitionFoundCard } from "./cards/noDefinitionFoundCard";
import { definitionsCard } from "./cards/definitionsCard";
import { EditionHandler } from "./EditionHandler";

export interface BotActivityHandlerDependencies {
    definitionStore: IDefinitionStore,
    logger: ILogger
}


const ACTIONNAME_HELP = "help"
const ACTIONNAME_NEW_DEFINITION = "new definition"
const ACTIONNAME_CREATE_DEFINITION = "create definition"
const ACTIONNAME_EDIT_DEFINITION = "edit definition"
const ACTIONNAME_UPDATE_DEFINITION = "update definition"
const ACTIONNAME_LIST_DEFINITIONS = "list definitions"

const INVOKE_NEW_DEFINITION = "new definition"

export class BotActivityHandler extends TeamsActivityHandler {

    private editionHandler: EditionHandler

    constructor(private deps: BotActivityHandlerDependencies) {
        super();
        this.onMessage(async (context, next) => await this.handleMessagesAsync(context, next));
        this.editionHandler = new EditionHandler(deps)
        // Handle invoke by bot action
        this.onInvokeActivity = (context) => this.handleInvokeAsync(context);
    }

    /**
     * Handles invoke types not currently supported by the teamsActivityHandler,
     * such as the refresh
     * @param context
     * @returns
     */
    async handleInvokeAsync(context: TurnContext): Promise<InvokeResponse> {
        if (context.activity.name === "adaptiveCard/action") {
            return await this.handleAdaptiveCardAction(context);
        }

        try {
            return super.onInvokeActivity(context);
        } catch (error) {
            this.deps.logger.error(error);
            return {
                status: 500,
            };
        }
    }

    async handleAdaptiveCardAction(context: TurnContext): Promise<InvokeResponse> {
        this.deps.logger.debug("Refresh action received")
        if (context.activity?.value?.action?.verb === INVOKE_NEW_DEFINITION) {
            return await this.editionHandler.handleEditDefinitionAsync(context)
        }
        throw Error(
            `Verb not implemented: ${context.activity.value?.action?.verb}`
        );
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
                await this.editionHandler.showNewDefinitionFormAsync(context)
                break
            case ACTIONNAME_CREATE_DEFINITION:
            case ACTIONNAME_UPDATE_DEFINITION:
                await this.editionHandler.saveDefinitionAsync(context)
                break
            case ACTIONNAME_EDIT_DEFINITION:
                await this.editionHandler.showEditDefinitionFormAsync(context)
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