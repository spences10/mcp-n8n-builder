import {
	ErrorCode,
	McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { config } from '../config.js';
import { N8nApiClient } from '../n8n-api-client.js';
import {
	CreateWorkflowInputSchema,
	WorkflowSchema,
} from '../schemas.js';

/**
 * Helper function to format output based on verbosity setting
 * @param summary The human-readable summary text
 * @param details The full JSON details
 * @param verbosity The verbosity level (concise or full)
 * @returns Formatted text based on verbosity setting
 */
function format_output(
	summary: string,
	details: any,
	verbosity?: string,
): string {
	// Use the provided verbosity parameter if available, otherwise fall back to config
	const output_verbosity = verbosity || config.output_verbosity;

	if (output_verbosity === 'full') {
		return (
			summary +
			'\n\nFull details:\n' +
			JSON.stringify(details, null, 2)
		);
	} else {
		// Default to concise mode
		return summary;
	}
}

/**
 * Handles the list_workflows tool
 */
export async function handle_list_workflows(
	api_client: N8nApiClient,
	args: any,
) {
	try {
		const workflows = await api_client.list_workflows(args);

		if (!workflows || workflows.length === 0) {
			return {
				content: [
					{
						type: 'text',
						text: 'No workflows found.',
					},
				],
			};
		}

		// Create a summary of the workflows
		const active_count = workflows.filter(
			(wf: { active: boolean }) => wf.active,
		).length;
		const inactive_count = workflows.length - active_count;

		const summary = `Found ${workflows.length} workflow${
			workflows.length !== 1 ? 's' : ''
		} (${active_count} active, ${inactive_count} inactive):\n\n`;

		// Create a list of workflows with their basic info
		const workflow_list = workflows
			.map((wf: any, index: number) => {
				const status = wf.active ? 'Active' : 'Inactive';
				const tags =
					wf.tags
						?.map((tag: { name: string }) => tag.name)
						.join(', ') || 'None';
				return `${index + 1}. "${wf.name}" (ID: ${wf.id})
   Status: ${status}
   Created: ${new Date(wf.created_at).toLocaleString()}
   Tags: ${tags}`;
			})
			.join('\n\n');

		return {
			content: [
				{
					type: 'text',
					text: format_output(
						summary + workflow_list,
						workflows,
						args.verbosity,
					),
				},
			],
		};
	} catch (error: any) {
		return {
			content: [
				{
					type: 'text',
					text: `Error listing workflows: ${
						error.message || String(error)
					}`,
				},
			],
			isError: true,
		};
	}
}

/**
 * Handles the create_workflow tool
 */
export async function handle_create_workflow(
	api_client: N8nApiClient,
	args: any,
) {
	try {
		// Validate input with Zod
		const parsed_input = CreateWorkflowInputSchema.parse(args);

		const workflow = await api_client.create_workflow(
			parsed_input.workflow,
			parsed_input.activate,
		);

		const activation_status = workflow.active
			? 'activated'
			: 'created (not activated)';

		return {
			content: [
				{
					type: 'text',
					text: `Successfully ${activation_status} workflow "${workflow.name}" (ID: ${workflow.id})`,
				},
			],
		};
	} catch (error: any) {
		if (error.name === 'ZodError') {
			return {
				content: [
					{
						type: 'text',
						text: `Validation error: ${error.message}`,
					},
				],
				isError: true,
			};
		}
		return {
			content: [
				{
					type: 'text',
					text: `Error creating workflow: ${
						error.message || String(error)
					}`,
				},
			],
			isError: true,
		};
	}
}

/**
 * Handles the get_workflow tool
 */
export async function handle_get_workflow(
	api_client: N8nApiClient,
	args: any,
) {
	if (!args.id) {
		throw new McpError(
			ErrorCode.InvalidParams,
			'Workflow ID is required',
		);
	}

	try {
		const workflow = await api_client.get_workflow(args.id);

		// Format a summary of the workflow
		const activation_status = workflow.active ? 'Active' : 'Inactive';
		const node_count = workflow.nodes.length;
		const trigger_nodes = workflow.nodes.filter(
			(node: { type: string }) =>
				node.type.toLowerCase().includes('trigger'),
		).length;

		const summary = `Workflow: "${workflow.name}" (ID: ${args.id})
Status: ${activation_status}
Created: ${new Date(workflow.created_at).toLocaleString()}
Updated: ${new Date(workflow.updated_at).toLocaleString()}
Nodes: ${node_count} (including ${trigger_nodes} trigger nodes)
Tags: ${
			workflow.tags
				?.map((tag: { name: string }) => tag.name)
				.join(', ') || 'None'
		}`;

		return {
			content: [
				{
					type: 'text',
					text: format_output(summary, workflow, args.verbosity),
				},
			],
		};
	} catch (error: any) {
		return {
			content: [
				{
					type: 'text',
					text: `Error retrieving workflow: ${
						error.message || String(error)
					}`,
				},
			],
			isError: true,
		};
	}
}

/**
 * Handles the update_workflow tool
 */
export async function handle_update_workflow(
	api_client: N8nApiClient,
	args: any,
) {
	if (!args.id || !args.workflow) {
		throw new McpError(
			ErrorCode.InvalidParams,
			'Workflow ID and updated workflow data are required',
		);
	}

	try {
		// Validate workflow with Zod
		const parsed_workflow = WorkflowSchema.parse(args.workflow);

		const workflow = await api_client.update_workflow(
			args.id,
			parsed_workflow,
		);

		const activation_status = workflow.active ? 'active' : 'inactive';

		return {
			content: [
				{
					type: 'text',
					text: `Successfully updated workflow "${workflow.name}" (ID: ${args.id}, Status: ${activation_status})`,
				},
			],
		};
	} catch (error: any) {
		if (error.name === 'ZodError') {
			return {
				content: [
					{
						type: 'text',
						text: `Validation error: ${error.message}`,
					},
				],
				isError: true,
			};
		}
		return {
			content: [
				{
					type: 'text',
					text: `Error updating workflow: ${
						error.message || String(error)
					}`,
				},
			],
			isError: true,
		};
	}
}

/**
 * Handles the delete_workflow tool
 */
export async function handle_delete_workflow(
	api_client: N8nApiClient,
	args: any,
) {
	if (!args.id) {
		throw new McpError(
			ErrorCode.InvalidParams,
			'Workflow ID is required',
		);
	}

	// First get the workflow to show its name
	try {
		const workflow = await api_client.get_workflow(args.id);

		// Now delete the workflow
		const result = await api_client.delete_workflow(args.id);

		return {
			content: [
				{
					type: 'text',
					text: `Successfully deleted workflow "${workflow.name}" (ID: ${args.id})`,
				},
			],
		};
	} catch (error: any) {
		return {
			content: [
				{
					type: 'text',
					text: `Error deleting workflow: ${
						error.message || String(error)
					}`,
				},
			],
			isError: true,
		};
	}
}

/**
 * Handles the activate_workflow tool
 */
export async function handle_activate_workflow(
	api_client: N8nApiClient,
	args: any,
) {
	if (!args.id) {
		throw new McpError(
			ErrorCode.InvalidParams,
			'Workflow ID is required',
		);
	}

	try {
		const result = await api_client.activate_workflow(args.id);
		return {
			content: [
				{
					type: 'text',
					text: `Successfully activated workflow "${result.name}" (ID: ${args.id})`,
				},
			],
		};
	} catch (error: any) {
		return {
			content: [
				{
					type: 'text',
					text: `Error activating workflow: ${
						error.message || String(error)
					}`,
				},
			],
			isError: true,
		};
	}
}

/**
 * Handles the deactivate_workflow tool
 */
export async function handle_deactivate_workflow(
	api_client: N8nApiClient,
	args: any,
) {
	if (!args.id) {
		throw new McpError(
			ErrorCode.InvalidParams,
			'Workflow ID is required',
		);
	}

	try {
		const result = await api_client.deactivate_workflow(args.id);
		return {
			content: [
				{
					type: 'text',
					text: `Successfully deactivated workflow "${result.name}" (ID: ${args.id})`,
				},
			],
		};
	} catch (error: any) {
		return {
			content: [
				{
					type: 'text',
					text: `Error deactivating workflow: ${
						error.message || String(error)
					}`,
				},
			],
			isError: true,
		};
	}
}
