import { Definition } from "../../domain";

export type NextAction = "new definition" | "update definition"


export function editDefinitionPlaceholderWithRefresh(next: NextAction, definition: Definition, initiatorId: string, userIds: string[], userName: string) {
    const now = Date.now()
    const refresh = {
        "action": {
            "type": "Action.Execute",
            "title": "Submit",
            "verb": next,
            "data": {
                initiatorId,
                initiatorName: userName,
                definition,
                initiatedAtTs: now
            }
        },
        userIds
    }
    const card: any = editDefinitionPlaceholder(userName, definition)
    card["refresh"] = refresh
    return card
}

export function editDefinitionPlaceholder(userName: string, definition: Definition): any {
    return {
        "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
        "type": "AdaptiveCard",
        "originator": "c9b4352b-a76b-43b9-88ff-80edddaa243b",
        "version": "1.4",
        "body": [
            {
                "type": "TextBlock",
                "text": `${userName} is setting a definition for ${definition.initialism}`,
                "wrap": true
            }
        ]
    };
}

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
                "type": "TextBlock",
                "text": `**Initial / acronym**`,
                "wrap": true
            },
            {
                "type": "Input.Text",
                "id": "initialism",
                "placeholder": "e.g. NASA",
                value: definition?.initialism
            },
            {
                "type": "TextBlock",
                "text": `**Full text name**`,
                "wrap": true
            },
            {
                "type": "Input.Text",
                "id": "fullName",
                "placeholder": "e.g. National Space Agency",
                "value": definition?.fullName
            },
            {
                "type": "TextBlock",
                "text": `**Definition**`,
                "wrap": true
            },
            {
                "type": "Input.Text",
                "id": "definition",
                "placeholder": "e.g. Agency looking for martians since 1753",
                value: definition?.definition
            },
            {
                "type": "TextBlock",
                "text": `**URL**`,
                "wrap": true
            },
            {
                "type": "Input.Text",
                "id": "url",
                "placeholder": "e.g. https://nasa.gov",
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
                            "id": definition?.id,
                            "dictionaryId": definition?.dictionaryId
                        }
                    }
                ]
            }
        ]
    }
}