import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
	ErrorCode,
	ListResourcesRequestSchema,
	ListResourceTemplatesRequestSchema,
	McpError,
	ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { config } from './config.js';
import { N8nApiClient } from './n8n-api-client.js';

/**
 * Helper function to format output based on verbosity setting
 * @param data The data to format
 * @param verbosity The verbosity level (concise or full)
 * @returns Formatted JSON based on verbosity setting
 */
function format_resource_output(
	data: any,
	verbosity?: string,
): string {
	// Use the provided verbosity parameter if available, otherwise fall back to config
	const output_verbosity = verbosity || config.output_verbosity;

	if (output_verbosity === 'full') {
		return JSON.stringify(data, null, 2);
	} else {
		// For concise mode, we'll still return JSON but with a more compact representation
		// This ensures the AI can still parse the data but it takes up less context window space
		const simplified = Array.isArray(data)
			? data.map(simplify_object)
			: simplify_object(data);

		return JSON.stringify(simplified, null, 2);
	}
}

/**
 * Simplifies an object by keeping only essential fields
 * @param obj The object to simplify
 * @returns A simplified version of the object
 */
function simplify_object(obj: any): any {
	if (!obj || typeof obj !== 'object') return obj;

	// For workflows, keep only essential fields
	if (obj.name && obj.id && obj.nodes) {
		return {
			id: obj.id,
			name: obj.name,
			active: obj.active,
			created_at: obj.created_at,
			updated_at: obj.updated_at,
			node_count: obj.nodes?.length || 0,
			tags: obj.tags?.map((tag: any) => tag.name) || [],
		};
	}

	// For executions, keep only essential fields
	if (obj.id && obj.workflowId && obj.startedAt) {
		return {
			id: obj.id,
			workflowId: obj.workflowId,
			status: obj.status,
			startedAt: obj.startedAt,
			stoppedAt: obj.stoppedAt,
			finished: obj.finished,
			mode: obj.mode,
		};
	}

	// Default case, return the object as is
	return obj;
}

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
								text: format_resource_output(workflows),
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
								text: format_resource_output(workflow),
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
								text: format_resource_output(execution),
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
