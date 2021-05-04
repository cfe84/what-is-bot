import { Definition } from "../../domain";

export function editDefinitionCard(definition?: Definition) {
    const isCreate = !definition?.id
    return {
        "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
        "type": "AdaptiveCard",
        "version": "1.0",
        "body": [
            {
                "type": "TextBlock",
                "text": `${isCreate ? "Create" : "Update"} definition`,
                "wrap": true
            },
            {
                "type": "Input.Text",
                "id": "fullName",
                "placeholder": "Full name",
                value: definition?.fullName
            },
            {
                "type": "Input.Text",
                "id": "initialism",
                "placeholder": "Initialism",
                value: definition?.initialism
            },
            {
                "type": "Input.Text",
                "id": "definition",
                "placeholder": "Definition",
                value: definition?.definition
            },
            {
                "type": "Input.Text",
                "id": "url",
                "placeholder": "URL",
                value: definition?.url
            },
            {
                "type": "ActionSet",
                "separator": true,
                "actions": [
                    {
                        "type": "Action.Submit",
                        "title": isCreate ? "Create" : "Update",
                        "data": {
                            "text": `${isCreate ? "create" : "update"} definition`
                        }
                    }
                ]
            }
        ]
    }
}