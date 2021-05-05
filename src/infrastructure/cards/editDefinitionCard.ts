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
                "id": "initialism",
                "placeholder": "Initials or acronym (e.g. NASA)",
                value: definition?.initialism
            },
            {
                "type": "Input.Text",
                "id": "fullName",
                "placeholder": "Full text name (e.g. National Space Agency)",
                "value": definition?.fullName
            },
            {
                "type": "Input.Text",
                "id": "definition",
                "placeholder": "Definition (e.g. Agency looking for martians since 1753)",
                value: definition?.definition
            },
            {
                "type": "Input.Text",
                "id": "url",
                "placeholder": "URL (e.g. https://nasa.gov)",
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
                            "text": `${isCreate ? "create" : "update"} definition`,
                            "id": definition?.id
                        }
                    }
                ]
            }
        ]
    }
}