import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';

import '@thzero/library_common/utility/string.js';
import MessagingService from '../index.js';

const inject = (target, name, value) => {
	Object.defineProperty(target, name, { value, writable: true, configurable: true });
	return target;
};

const newLogger = () => {
	const entries = { info2: [], exception: [] };
	return {
		entries,
		debug() {}, info() {}, warn() {}, warn2() {}, error() {}, fatal() {}, trace() {},
		info2(message, data, correlationId) { entries.info2.push({ message, correlationId }); },
		exception(clazz, method, err, correlationId) { entries.exception.push({ clazz, method, err, correlationId }); }
	};
};

let service;
let logger;
let posted;

beforeEach(() => {
	service = new MessagingService();
	logger = newLogger();
	posted = [];
	inject(service, '_logger', logger);
	inject(service, '_config', { get: () => 'xoxb-token' });
	service._webClient = { chat: { postMessage: async (payload) => { posted.push(payload); return { ts: '1.2' }; } } };
});

// Regression: the module imported '@thzero/library_server/service/index' with no
// .js extension. Node ESM does not guess extensions, so importing this package
// threw ERR_MODULE_NOT_FOUND - it could not be loaded at all. The package.json
// was also missing "type": "module", which every sibling package declares.
describe('the module loads', () => {
	it('exports the service', () => {
		assert.equal(typeof MessagingService, 'function');
		assert.ok(service instanceof MessagingService);
	});
});

describe('message', () => {
	it('posts the text to the channel', async () => {
		const response = await service.message('cid', '#general', 'hello');
		assert.equal(service._hasSucceeded(response), true);
		assert.deepEqual(posted, [ { channel: '#general', text: 'hello' } ]);
	});

	it('logs the send with its timestamp', async () => {
		await service.message('cid', '#general', 'hello');
		assert.equal(logger.entries.info2.length, 1);
		assert.ok(logger.entries.info2[0].message.includes('#general'));
		assert.ok(logger.entries.info2[0].message.includes('1.2'));
		assert.equal(logger.entries.info2[0].correlationId, 'cid');
	});

	it('returns a failed response when slack rejects', async () => {
		service._webClient = { chat: { postMessage: async () => { throw new Error('slack is down'); } } };
		const response = await service.message('cid-123', '#general', 'hello');
		assert.equal(service._hasFailed(response), true);
		assert.equal(response.correlationId, 'cid-123');
	});

	// Regression: the failure path read
	// `this._logger.exception('MessagingService', 'message', err), correlationId;`
	// - the comma operator, which evaluated correlationId and threw it away rather
	// than passing it to the logger.
	it('logs the exception against its correlationId', async () => {
		service._webClient = { chat: { postMessage: async () => { throw new Error('slack is down'); } } };
		await service.message('cid-123', '#general', 'hello');
		// two entries: the explicit call in the catch, and the one _error makes for
		// the err it is handed
		assert.ok(logger.entries.exception.length >= 1);
		for (const entry of logger.entries.exception) {
			assert.equal(entry.correlationId, 'cid-123');
			assert.equal(entry.method, 'message');
		}
	});

	it('fails rather than throws when the client was never built', async () => {
		service._webClient = null;
		const response = await service.message('cid', '#general', 'hello');
		assert.equal(service._hasFailed(response), true);
	});
});
