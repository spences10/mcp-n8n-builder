import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
	ErrorCode,
	ListResourcesRequestSchema,
	ListResourceTemplatesRequestSchema,
	McpError,
	ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { N8nApiClient } from './n8n-api-client.js';

/**
 * Sets up MCP resource handlers for the n8n workflow builder server
 */
export function setup_resource_handlers(
	server: Server,
	api_client: N8nApiClient,
) {
	// List available resources
	server.setRequestHandler(ListResourcesRequestSchema, async () => ({
		resources: [
			{
				uri: `n8n://workflows`,
				name: `n8n Workflows`,
				mimeType: 'application/json',
				description: 'List of all workflows in n8n',
			},
		],
	}));

	// List resource templates
	server.setRequestHandler(
		ListResourceTemplatesRequestSchema,
		async () => ({
			resourceTemplates: [
				{
					uriTemplate: 'n8n://workflows/{id}',
					name: 'n8n Workflow',
					mimeType: 'application/json',
					description: 'Details of a specific n8n workflow',
				},
				{
					uriTemplate: 'n8n://executions/{id}',
					name: 'n8n Execution',
					mimeType: 'application/json',
					description: 'Details of a specific n8n workflow execution',
				},
			],
		}),
	);

	// Read resource handler
	server.setRequestHandler(
		ReadResourceRequestSchema,
		async (request) => {
			const { uri } = request.params;

			// Handle workflows list
			if (uri === 'n8n://workflows') {
				try {
					const workflows = await api_client.list_workflows();
					return {
						contents: [
							{
								uri,
								mimeType: 'application/json',
								text: JSON.stringify(workflows, null, 2),
							},
						],
					};
				} catch (error: any) {
					throw new McpError(
						ErrorCode.InternalError,
						`Failed to fetch workflows: ${
							error.message || String(error)
						}`,
					);
				}
			}

			// Handle specific workflow
			const workflow_match = uri.match(/^n8n:\/\/workflows\/(.+)$/);
			if (workflow_match) {
				const workflow_id = workflow_match[1];
				try {
					const workflow = await api_client.get_workflow(workflow_id);
					return {
						contents: [
							{
								uri,
								mimeType: 'application/json',
								text: JSON.stringify(workflow, null, 2),
							},
						],
					};
				} catch (error: any) {
					throw new McpError(
						ErrorCode.InternalError,
						`Failed to fetch workflow ${workflow_id}: ${
							error.message || String(error)
						}`,
					);
				}
			}

			// Handle specific execution
			const execution_match = uri.match(/^n8n:\/\/executions\/(.+)$/);
			if (execution_match) {
				const execution_id = execution_match[1];
				try {
					const execution = await api_client.get_execution(
						execution_id,
					);
					return {
						contents: [
							{
								uri,
								mimeType: 'application/json',
								text: JSON.stringify(execution, null, 2),
							},
						],
					};
				} catch (error: any) {
					throw new McpError(
						ErrorCode.InternalError,
						`Failed to fetch execution ${execution_id}: ${
							error.message || String(error)
						}`,
					);
				}
			}

			throw new McpError(
				ErrorCode.InvalidRequest,
				`Invalid URI format: ${uri}`,
			);
		},
	);
}
