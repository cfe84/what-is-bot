import * as  express from "express"
import { BotFrameworkAdapter } from 'botbuilder'
import { BotActivityHandler } from '../infrastructure/BotActivityHandler'
import { FsStore } from "../infrastructure/FsStore";
import { ConsoleLogger } from "../infrastructure/ConsoleLogger";

require('dotenv').config();
// Create adapter.
// See https://aka.ms/about-bot-adapter to learn more about adapters.
const adapter = new BotFrameworkAdapter({
    appId: process.env.BotId,
    appPassword: process.env.BotPassword
});

const logger = new ConsoleLogger()


adapter.onTurnError = async (context, error) => {
    // This check writes out errors to console log .vs. app insights.
    // NOTE: In production environment, you should consider logging this to Azure
    //       application insights.
    logger.error(`\n [onTurnError] unhandled error: ${error}`);

    // Send a trace activity, which will be displayed in Bot Framework Emulator
    await context.sendTraceActivity(
        'OnTurnError Trace',
        `${error}`,
        'https://www.botframework.com/schemas/error',
        'TurnError'
    );

    // Send a message to the user
    await context.sendActivity('Obviously the author of this bot doesn\'t know what they\'re doing.');
};

const store = new FsStore(process.env.FilePath || "")

// Create bot handlers
const botActivityHandler = new BotActivityHandler({ thingStore: store, logger });

// Create HTTP server.
const server = express();
const port = process.env.port || process.env.PORT || 3978;
server.listen(port, () =>
    logger.log(`Listening at http://localhost:${port}`)
);

// Listen for incoming requests.
server.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        // Process bot activity
        await botActivityHandler.run(context);
    });
});
