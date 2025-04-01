import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
	CallToolRequestSchema,
	ErrorCode,
	ListToolsRequestSchema,
	McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { N8nApiClient } from '../n8n-api-client.js';

// Import tool handlers
import {
	handle_activate_workflow,
	handle_create_workflow,
	handle_deactivate_workflow,
	handle_delete_workflow,
	handle_get_workflow,
	handle_list_workflows,
	handle_update_workflow,
} from './workflow-tools.js';

import {
	handle_get_execution,
	handle_list_executions,
} from './execution-tools.js';

/**
 * Sets up MCP tool handlers for the n8n workflow builder server
 */
export function setup_tool_handlers(
	server: Server,
	api_client: N8nApiClient,
) {
	// List available tools
	server.setRequestHandler(ListToolsRequestSchema, async () => ({
		tools: [
			{
				name: 'list_workflows',
				description:
					'Lists all workflows from n8n with their basic information including ID, name, status, creation date, and tags. Use this tool to get an overview of available workflows before performing operations on specific workflows. Results can be filtered by active status, tags, or name.',
				inputSchema: {
					type: 'object',
					properties: {
						active: {
							type: 'boolean',
							description: 'Filter by active status',
						},
						tags: {
							type: 'string',
							description: 'Filter by tags (comma-separated)',
						},
						name: {
							type: 'string',
							description: 'Filter by workflow name',
						},
					},
				},
			},
			{
				name: 'create_workflow',
				description:
					'Creates a new workflow in n8n with specified nodes and connections. Note that only workflows with automatic trigger nodes (schedule, webhook, etc.) can be activated - workflows with only manual triggers cannot be activated. Returns the created workflow with its assigned ID.',
				inputSchema: {
					type: 'object',
					properties: {
						workflow: {
							type: 'object',
							description:
								'Complete workflow structure including nodes, connections, and settings',
							properties: {
								name: {
									type: 'string',
									description:
										'Name of the workflow - use descriptive names for easier identification',
								},
								nodes: {
									type: 'array',
									description:
										'Array of workflow nodes (triggers, actions, etc.)',
									items: {
										type: 'object',
									},
								},
								connections: {
									type: 'object',
									description:
										'Connections between nodes defining the workflow execution path',
								},
								settings: {
									type: 'object',
									description:
										'Workflow settings like error handling, execution timeout, etc.',
								},
							},
							required: ['name', 'nodes', 'connections'],
						},
						activate: {
							type: 'boolean',
							description:
								'Whether to activate the workflow after creation (only works for workflows with automatic triggers)',
						},
					},
					required: ['workflow'],
				},
			},
			{
				name: 'get_workflow',
				description:
					"Retrieves complete details of a specific workflow by its ID, including all nodes, connections, settings, and metadata. Use this tool when you need to examine a workflow's structure before updating it or to understand how it works.",
				inputSchema: {
					type: 'object',
					properties: {
						id: {
							type: 'string',
							description:
								'ID of the workflow to retrieve - can be obtained from list_workflows',
						},
					},
					required: ['id'],
				},
			},
			{
				name: 'update_workflow',
				description:
					'Updates an existing workflow with new configuration. Typically used after retrieving a workflow with get_workflow, modifying its structure, and then saving the changes. The entire workflow structure must be provided, not just the parts being changed.',
				inputSchema: {
					type: 'object',
					properties: {
						id: {
							type: 'string',
							description:
								'ID of the workflow to update - can be obtained from list_workflows',
						},
						workflow: {
							type: 'object',
							description:
								'Complete updated workflow structure - must include all nodes and connections, not just changes',
							properties: {
								name: {
									type: 'string',
									description: 'Name of the workflow',
								},
								nodes: {
									type: 'array',
									description:
										'Array of workflow nodes (triggers, actions, etc.)',
									items: {
										type: 'object',
									},
								},
								connections: {
									type: 'object',
									description:
										'Connections between nodes defining the workflow execution path',
								},
								settings: {
									type: 'object',
									description:
										'Workflow settings like error handling, execution timeout, etc.',
								},
							},
							required: ['name', 'nodes', 'connections'],
						},
					},
					required: ['id', 'workflow'],
				},
			},
			{
				name: 'delete_workflow',
				description:
					'Permanently deletes a workflow by its ID. This action cannot be undone, so use with caution. Consider deactivating workflows instead if you might need them again later.',
				inputSchema: {
					type: 'object',
					properties: {
						id: {
							type: 'string',
							description:
								'ID of the workflow to delete - can be obtained from list_workflows',
						},
					},
					required: ['id'],
				},
			},
			{
				name: 'activate_workflow',
				description:
					'Activates a workflow by its ID, enabling it to run automatically based on its trigger (schedule, webhook, etc.). Note that only workflows with automatic trigger nodes can be activated - workflows with only manual triggers cannot be activated.',
				inputSchema: {
					type: 'object',
					properties: {
						id: {
							type: 'string',
							description:
								'ID of the workflow to activate - can be obtained from list_workflows',
						},
					},
					required: ['id'],
				},
			},
			{
				name: 'deactivate_workflow',
				description:
					'Deactivates a workflow by its ID, preventing it from running automatically. The workflow will still exist and can be manually executed or reactivated later. Use this instead of deleting workflows that you might need again.',
				inputSchema: {
					type: 'object',
					properties: {
						id: {
							type: 'string',
							description:
								'ID of the workflow to deactivate - can be obtained from list_workflows',
						},
					},
					required: ['id'],
				},
			},
			{
				name: 'list_executions',
				description:
					'Lists workflow execution history with details on success/failure status, duration, and timestamps. Use this tool to monitor workflow performance, troubleshoot issues, or verify that workflows are running as expected. Results can be filtered by workflow ID, status, and limited to a specific number.',
				inputSchema: {
					type: 'object',
					properties: {
						workflowId: {
							type: 'string',
							description:
								'Filter executions by workflow ID - can be obtained from list_workflows',
						},
						status: {
							type: 'string',
							description:
								'Filter by execution status (error, success, waiting)',
							enum: ['error', 'success', 'waiting'],
						},
						limit: {
							type: 'number',
							description:
								'Maximum number of executions to return - useful for workflows with many executions',
						},
					},
				},
			},
			{
				name: 'get_execution',
				description:
					'Retrieves detailed information about a specific workflow execution, including execution time, status, and optionally the full data processed at each step. Particularly useful for debugging failed workflows or understanding data transformations between nodes.',
				inputSchema: {
					type: 'object',
					properties: {
						id: {
							type: 'string',
							description:
								'ID of the execution to retrieve - can be obtained from list_executions',
						},
						includeData: {
							type: 'boolean',
							description:
								'Whether to include detailed execution data showing the input/output at each node (may be large for complex workflows)',
						},
					},
					required: ['id'],
				},
			},
		],
	}));

	// Handle tool calls
	server.setRequestHandler(CallToolRequestSchema, async (request) => {
		const { name, arguments: args } = request.params;

		try {
			switch (name) {
				case 'list_workflows':
					return await handle_list_workflows(api_client, args);
				case 'create_workflow':
					return await handle_create_workflow(api_client, args);
				case 'get_workflow':
					return await handle_get_workflow(api_client, args);
				case 'update_workflow':
					return await handle_update_workflow(api_client, args);
				case 'delete_workflow':
					return await handle_delete_workflow(api_client, args);
				case 'activate_workflow':
					return await handle_activate_workflow(api_client, args);
				case 'deactivate_workflow':
					return await handle_deactivate_workflow(api_client, args);
				case 'list_executions':
					return await handle_list_executions(api_client, args);
				case 'get_execution':
					return await handle_get_execution(api_client, args);
				default:
					throw new McpError(
						ErrorCode.MethodNotFound,
						`Unknown tool: ${name}`,
					);
			}
		} catch (error: any) {
			if (error instanceof McpError) {
				throw error;
			}

			return {
				content: [
					{
						type: 'text',
						text: `Error: ${error.message || String(error)}`,
					},
				],
				isError: true,
			};
		}
	});
}
