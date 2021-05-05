import { Definition } from "../../domain";

export function definitionCreatedConfirmation(definition: Definition, update: boolean = false) {
  return {
    "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
    "type": "AdaptiveCard",
    "version": "1.0",
    "body": [
      {
        "type": "TextBlock",
        "text": `${update ? "Updated" : "Created"} definition for "${definition.fullName}"`,
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