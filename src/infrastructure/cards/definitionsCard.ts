import { Definition } from "../../domain"

export function definitionsCard(definitions: Definition[]) {
  const definitionsElements = definitions.map((definition: Definition) => {
    return {
      "type": "ColumnSet",
      "separator": true,
      "columns": [
        {
          "type": "Column",
          "width": "stretch",
          "items": [
            {
              "type": "RichTextBlock",
              "inlines": [
                {
                  "type": "TextRun",
                  "text": `**${definition.fullName}**` +
                    (definition.initialism ? ` (${definition.initialism})` : "") +
                    `: ${definition.definition}.` +
                    (definition.url ? ` [Learn more](${definition.url}).` : "")
                }
              ],
              "height": "stretch"
            }
          ]
        },
        {
          "type": "Column",
          "width": "auto",
          "items": [
            {
              "type": "ActionSet",
              "actions": [
                {
                  "type": "Action.Submit",
                  "title": "Change",
                  "style": "positive",
                  "data": {
                    "text": "edit definition",
                    "id": definition.id
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  })
  return {
    "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
    "type": "AdaptiveCard",
    "version": "1.0",
    "body": [
      {
        "type": "TextBlock",
        "text": `Here is what I found:`,
        "wrap": true
      },
      ...definitionsElements
    ],

  }
}