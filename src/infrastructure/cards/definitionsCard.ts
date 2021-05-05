import { Definition } from "../../domain"

export function definitionsCard(definitions: Definition[]) {
  const definitionsElements = definitions.map((definition: Definition) => {
    const learnMoreButton = definition.url ?
      {
        "type": "ActionSet",
        "actions": [{
          "type": "Action.OpenUrl",
          "title": "Learn more",
          "url": definition.url
        }]
      }
      : undefined
    const updateButton = {
      "type": "ActionSet",
      "actions": [{
        "type": "Action.Submit",
        "title": "Update",
        "style": "positive",
        "data": {
          "text": "edit definition",
          "id": definition.id
        }
      }]
    }
    const columnize = (actionSet: any) => ({
      "type": "Column",
      "width": "auto",
      "items": [
        actionSet
      ]
    })
    const card = {
      "type": "ColumnSet",
      "separator": true,
      "columns": [
        {
          "type": "Column",
          "width": "stretch",
          "items": [
            {
              "type": "TextBlock",
              "text": `**${definition.fullName}**` +
                (definition.initialism ? ` (${definition.initialism})` : "") +
                `: ${definition.definition}.`
            },
          ]
        },

      ]
    }
    if (definition.url) {
      card.columns.push(columnize(learnMoreButton))
    }
    card.columns.push(columnize(updateButton))
    return card
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