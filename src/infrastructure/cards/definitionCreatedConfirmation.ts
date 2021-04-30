import { Definition } from "../../domain";

export function definitionCreatedConfirmation(definition: Definition) {
  return {
    "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
    "type": "AdaptiveCard",
    "version": "1.0",
    "body": [
      {
        "type": "TextBlock",
        "text": `Created definition for "${definition.fullName}"`,
        "wrap": true
      },
      {
        "type": "ActionSet",
        "separator": "true",
        "actions": [
        ]
      }
    ],

  }
}