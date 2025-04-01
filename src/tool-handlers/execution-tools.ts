import {
	ErrorCode,
	McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { N8nApiClient } from '../n8n-api-client.js';

/**
 * Handles the list_executions tool
 */
export async function handle_list_executions(
	api_client: N8nApiClient,
	args: any,
) {
	try {
		const executions = await api_client.list_executions(args);

		if (!executions || executions.length === 0) {
			return {
				content: [
					{
						type: 'text',
						text: 'No executions found.',
					},
				],
			};
		}

		// Create a summary of the executions
		const success_count = executions.filter(
			(exec: any) => exec.finished && exec.status === 'success',
		).length;
		const failed_count = executions.filter(
			(exec: any) => exec.finished && exec.status !== 'success',
		).length;
		const running_count = executions.filter(
			(exec: any) => !exec.finished,
		).length;

		const summary =
			`Found ${executions.length} execution${
				executions.length !== 1 ? 's' : ''
			} ` +
			`(${success_count} successful, ${failed_count} failed, ${running_count} running):\n\n`;

		// Create a list of executions with their basic info
		const execution_list = executions
			.map((exec: any, index: number) => {
				const status = !exec.finished
					? 'Running'
					: exec.status === 'success'
					? 'Successful'
					: 'Failed';

				const start_time = new Date(exec.startedAt).toLocaleString();
				const end_time = exec.stoppedAt
					? new Date(exec.stoppedAt).toLocaleString()
					: 'Still running';

				const duration = exec.stoppedAt
					? (new Date(exec.stoppedAt).getTime() -
							new Date(exec.startedAt).getTime()) /
					  1000
					: null;

				const duration_text =
					duration !== null
						? `${duration.toFixed(2)} seconds`
						: 'Still running';

				return `${index + 1}. Execution ID: ${exec.id}
   Status: ${status}
   Workflow: ${exec.workflow_data?.name || 'Unknown'} (ID: ${
					exec.workflowId
				})
   Started: ${start_time}
   Duration: ${duration_text}`;
			})
			.join('\n\n');

		return {
			content: [
				{
					type: 'text',
					text:
						summary +
						execution_list +
						'\n\nFull details:\n' +
						JSON.stringify(executions, null, 2),
				},
			],
		};
	} catch (error: any) {
		return {
			content: [
				{
					type: 'text',
					text: `Error listing executions: ${
						error.message || String(error)
					}`,
				},
			],
			isError: true,
		};
	}
}

/**
 * Handles the get_execution tool
 */
export async function handle_get_execution(
	api_client: N8nApiClient,
	args: any,
) {
	if (!args.id) {
		throw new McpError(
			ErrorCode.InvalidParams,
			'Execution ID is required',
		);
	}

	try {
		const execution = await api_client.get_execution(
			args.id,
			args.includeData,
		);

		// Format a summary of the execution
		const status = execution.finished
			? execution.status === 'success'
				? 'Successful'
				: 'Failed'
			: 'Running';

		const start_time = new Date(execution.startedAt).toLocaleString();
		const end_time = execution.stoppedAt
			? new Date(execution.stoppedAt).toLocaleString()
			: 'Still running';

		const duration = execution.stoppedAt
			? (new Date(execution.stoppedAt).getTime() -
					new Date(execution.startedAt).getTime()) /
			  1000
			: null;

		const duration_text =
			duration !== null
				? `${duration.toFixed(2)} seconds`
				: 'Still running';

		const summary = `Execution ID: ${args.id}
Status: ${status}
Workflow: ${execution.workflow_data?.name || 'Unknown'} (ID: ${
			execution.workflowId
		})
Mode: ${execution.mode}
Started: ${start_time}
Ended: ${end_time}
Duration: ${duration_text}`;

		return {
			content: [
				{
					type: 'text',
					text:
						summary +
						'\n\nFull details:\n' +
						JSON.stringify(execution, null, 2),
				},
			],
		};
	} catch (error: any) {
		return {
			content: [
				{
					type: 'text',
					text: `Error retrieving execution: ${
						error.message || String(error)
					}`,
				},
			],
			isError: true,
		};
	}
}
