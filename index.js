import { WebClient } from '@slack/web-api';

import Service from '@thzero/library_server/service/index';

class MessagingService extends Service {
	constructor() {
		super();

		this._webClient = null;
	}

	init(injector) {
		super.init(injector);

		try {
			this._token = this._config.get(`messaging.slack.token`);
			this._webClient = new WebClient(this._token);
		}
		catch (err) {
			this._logger.exception(err);
		}
	}

	async message(channel, message) {
		try {
			// See: https://api.slack.com/methods/chat.postMessage
			const res = await this._webClient.chat.postMessage({ channel: channel, text: message });

			// `res` contains information about the posted message
			console.log('Message sent: ', res.ts);
		}
		catch (err) {
			this._logger.exception(err);
		}
	}
}

export default MessagingService;
