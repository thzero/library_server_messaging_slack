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
			this._logger.exception('MessagingService', 'init', err);
		}
	}

	async message(correlationId, channel, message) {
		try {
			// See: https://api.slack.com/methods/chat.postMessage
			const res = await this._webClient.chat.postMessage({ channel: channel, text: message });

			this._logger.info2(`External message to channel '${channel}' sent at ${res.ts}.`, null, correlationId);
		}
		catch (err) {
			this._logger.exception('MessagingService', 'message', err), correlationId;
		}
	}
}

export default MessagingService;
