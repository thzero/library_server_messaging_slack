import { WebClient } from '@slack/web-api';

import Service from '@thzero/library_server/service/index';

class MessagingService extends Service {
	constructor() {
		super();

		this._webClient = null;
	}

	init(injector) {
		super.init(injector);

		this._token = this._config.get(`messaging.slack.token`);
		this._webClient = new WebClient(this._token);
	}

	async message(channel, message) {
		// See: https://api.slack.com/methods/chat.postMessage
		const res = await this._webClient.chat.postMessage({ channel: conversationId, text: 'Hello there' });

		// `res` contains information about the posted message
		console.log('Message sent: ', res.ts);
	}
}

export default MessagingService;
