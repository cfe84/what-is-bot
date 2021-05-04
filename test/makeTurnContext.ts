import { ResourceResponse } from "botbuilder"
import { TurnContext } from "botbuilder-core"
import * as td from "testdouble"

export function makeTurnContext(activityText: string, value?: { [key: string]: string }): TurnContext {
  return {
    "sendActivity": td.func<Promise<ResourceResponse>>(),
    "bufferedReplyActivities": [],
    "activity": {
      "channelData": {
        "clientActivityID": "alkds;dsfk;dslkf;dslkfs;ld",
        "clientTimestamp": "2021-05-04T03:05:18.003Z"
      },
      "text": activityText,
      value,
      "textFormat": "plain",
      "type": "message",
      "channelId": "emulator",
      "from": {
        "id": "fromId",
        "name": "User",
        "role": "user"
      },
      "locale": "en-US",
      "timestamp": "2021-05-04T03:05:18.066Z",
      "conversation": {
        "id": "8e29bd20-ac85-11eb-8dcc-a3b47ba8dabe|livechat"
      },
      "id": "8e29bd20-ac85-11eb-b807-a7682f991e13",
      "localTimestamp": "2021-05-04T03:05:18.000Z",
      "recipient": {
        "id": "8e29bd20-ac85-11eb-8dcc-a3b47ba8dabe",
        "name": "Bot",
        "role": "bot"
      },
      "serviceUrl": "http://localhost:54553",
      "rawTimestamp": "2021-05-04T03:05:18.066Z",
      "rawLocalTimestamp": "2021-05-03T20:05:18-07:00",
      "callerId": "urn:botframework:azure"
    }
  } as any as TurnContext
}