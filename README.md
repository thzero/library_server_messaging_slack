![GitHub package.json version](https://img.shields.io/github/package-json/v/thzero/library_server_messaging_slack)
![David](https://img.shields.io/david/thzero/library_server_messaging_slack)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

# library_server_messaging_slack

Posts messages to Slack from [@thzero/library_server](https://github.com/thzero/library_server), using [@slack/web-api](https://github.com/slackapi/node-slack-sdk).

Intended for operational notices — a deploy finished, a job failed, a threshold was crossed. It is not a chat integration and does not receive anything from Slack.

## Requirements

### NodeJs

[NodeJs](https://nodejs.org) version 22+

### Slack

A Slack app with a bot token:

* Create an app at [api.slack.com/apps](https://api.slack.com/apps)
* Under **OAuth & Permissions**, add the `chat:write` bot token scope
* Install the app to the workspace and copy the **Bot User OAuth Token** (`xoxb-…`)
* Invite the bot to each channel you intend to post to — `chat.postMessage` fails with `not_in_channel` otherwise

### Installation

[![NPM](https://nodei.co/npm/@thzero/library_server_messaging_slack.png?compact=true)](https://npmjs.org/package/@thzero/library_server_messaging_slack)

```
npm install @thzero/library_server_messaging_slack
```

#### Peer dependencies

* `@thzero/library_common`
* `@thzero/library_common_service`
* `@thzero/library_server`

## What it provides

`index.js` — default export `MessagingService`, extending `Service`.

| Method | Purpose |
|---|---|
| `init(injector)` | Reads the token from config and builds the `WebClient`. A failure here is logged, not thrown — the service stays constructed but unusable. |
| `message(correlationId, channel, message)` | Posts `message` to `channel` via `chat.postMessage`. Returns a success response, or an error response carrying the correlationId when Slack rejects it. |

`message` never throws. A Slack outage produces a failed response and a logged exception rather than taking down the caller.

## Configuration

```json
{
    "app": {
        "messaging": {
            "slack": {
                "token": "xoxb-<bot user oauth token>"
            }
        }
    }
}
```

Keep the token out of source control — supply it from an environment variable through `config/custom-environment-variables.json`, the same way the database connection is handled.

## Wiring it up

Register it with the injector from `_initServices` in your `BootMain` derived class, or from a boot plugin's `initServices`, then resolve it where you need it:

```js
const serviceMessaging = injector.getService(AppConstants.InjectorKeys.SERVICE_MESSAGING_SLACK);
await serviceMessaging.message(correlationId, '#ops', `Deploy ${version} completed.`);
```

`channel` accepts either a channel name (`#ops`) or a channel ID (`C0123456789`). An ID is more robust — a renamed channel keeps its ID.

## Development

```
npm run lint       # eslint .
npm run lint:fix   # eslint . --fix
npm test           # node --test "test/*.test.js"
```
