#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

// Import our modules
import { config } from './config.js';
import { N8nApiClient } from './n8n-api-client.js';
import { setup_resource_handlers } from './resource-handlers.js';
import { setup_tool_handlers } from './tool-handlers/index.js';

class N8nWorkflowBuilderServer {
	private server: Server;
	private api_client: N8nApiClient;

	constructor() {
		this.server = new Server(
			{
				name: config.server_name,
				version: config.server_version,
			},
			{
				capabilities: {
					resources: {},
					tools: {},
				},
			},
		);

		this.api_client = new N8nApiClient({
			base_url: config.n8n_host,
			api_key: config.n8n_api_key,
		});

		// Set up resource and tool handlers
		setup_resource_handlers(this.server, this.api_client);
		setup_tool_handlers(this.server, this.api_client);

		// Error handling
		this.server.onerror = (error) =>
			console.error('[MCP Error]', error);
		process.on('SIGINT', async () => {
			await this.server.close();
			process.exit(0);
		});
	}

	async run() {
		const transport = new StdioServerTransport();
		await this.server.connect(transport);
		console.error(
			`${config.server_name} MCP server running on stdio`,
		);
	}
}

const server = new N8nWorkflowBuilderServer();
server.run().catch(console.error);
