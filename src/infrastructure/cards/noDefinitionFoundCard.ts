export function noDefinitionFoundCard(term: string) {
  return {
    "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
    "type": "AdaptiveCard",
    "version": "1.0",
    "body": [
      {
        "type": "TextBlock",
        "text": `I didn't find a definition for "${term}". If you know one create it!`,
        "wrap": true
      },
      {
        "type": "ActionSet",
        "separator": true,
        "actions": [
          {
            "type": "Action.Submit",
            "title": "Create a definition for " + term,
            "data": {
              "text": "new definition",
              "fullName": term
            }
          }
        ]
      }
    ]
  }
}