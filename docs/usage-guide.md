# Usage Guide

This document provides a guide on how to use the n8n Workflow Builder
MCP server.

## Prerequisites

Before using the MCP server, you need to have:

1. An n8n instance running and accessible via its REST API
2. An API key for the n8n instance
3. The MCP server installed and configured

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/mcp-n8n-builder.git
cd mcp-n8n-builder
```

2. Install dependencies:

```bash
npm install
```

3. Build the project:

```bash
npm run build
```

4. Configure the server by setting environment variables:

```bash
export N8N_HOST=http://localhost:5678/api/v1
export N8N_API_KEY=your-api-key
```

5. Start the server:

```bash
npm start
```

## Using the MCP Server with Claude

Once the MCP server is running, you can use it with Claude to create
and manage n8n workflows. Here are some examples of how to use the MCP
server with Claude:

### Listing Workflows

You can ask Claude to list all workflows in your n8n instance:

```
Can you list all workflows in my n8n instance?
```

Claude will use the `list_workflows` tool to fetch all workflows from
your n8n instance.

### Creating a Workflow

You can ask Claude to create a new workflow:

```
Can you create a workflow that fetches data from an API and sends it to a Slack channel?
```

Claude will use the `create_workflow` tool to create a new workflow
with the specified functionality.

#### Creating Workflows with Different Trigger Types

When creating workflows, it's important to understand the different
types of triggers:

1. **Manual Trigger Workflows**:

   ```
   Can you create a workflow with a manual trigger that fetches a random joke?
   ```

   - These workflows can only be started manually by clicking the
     "Test" or "Execute" button
   - They cannot be activated for automatic execution
   - Example node: `n8n-nodes-base.manualTrigger`

2. **Schedule Trigger Workflows**:

   ```
   Can you create a workflow that runs every hour to fetch weather data?
   ```

   - These workflows run automatically on a schedule
   - They can be activated for automatic execution
   - Example node: `n8n-nodes-base.scheduleTrigger`

3. **Webhook Trigger Workflows**:
   ```
   Can you create a workflow that listens for GitHub webhook events?
   ```
   - These workflows run when they receive an HTTP request
   - They can be activated for automatic execution
   - Example node: `n8n-nodes-base.webhook`

**Note**: Only workflows with automatic trigger nodes (schedule,
webhook, etc.) can be activated. Workflows with only manual triggers
cannot be activated.

### Updating a Workflow

You can ask Claude to update an existing workflow:

```
Can you update the "API to Slack" workflow to add error handling?
```

Claude will use the `get_workflow` tool to fetch the current workflow,
modify it to add error handling, and then use the `update_workflow`
tool to update the workflow.

### Activating/Deactivating a Workflow

You can ask Claude to activate or deactivate a workflow:

```
Can you activate the "API to Slack" workflow?
```

Claude will use the `activate_workflow` tool to activate the specified
workflow.

### Deleting a Workflow

You can ask Claude to delete a workflow:

```
Can you delete the "Test Workflow" workflow?
```

Claude will use the `delete_workflow` tool to delete the specified
workflow.

### Viewing Executions

You can ask Claude to view the executions of a workflow:

```
Can you show me the recent executions of the "API to Slack" workflow?
```

Claude will use the `list_executions` tool to fetch the recent
executions of the specified workflow.

## Using the MCP Server Programmatically

You can also use the MCP server programmatically using the MCP SDK:

```javascript
import { Client } from '@modelcontextprotocol/sdk/client';

async function main() {
	// Connect to the MCP server
	const client = new Client();
	await client.connect('n8n-workflow-builder');

	// List all workflows
	const workflows = await client.callTool('list_workflows', {});
	console.log('Workflows:', workflows);

	// Create a new workflow
	const newWorkflow = await client.callTool('create_workflow', {
		workflow: {
			name: 'API to Slack',
			nodes: [
				// Define nodes here
			],
			connections: {
				// Define connections here
			},
			settings: {
				// Define settings here
			},
		},
		activate: true,
	});
	console.log('New workflow:', newWorkflow);

	// Get a workflow
	const workflow = await client.callTool('get_workflow', {
		id: newWorkflow.id,
	});
	console.log('Workflow:', workflow);

	// Update a workflow
	const updatedWorkflow = await client.callTool('update_workflow', {
		id: workflow.id,
		workflow: {
			// Updated workflow definition
		},
	});
	console.log('Updated workflow:', updatedWorkflow);

	// Activate a workflow
	const activatedWorkflow = await client.callTool(
		'activate_workflow',
		{
			id: workflow.id,
		},
	);
	console.log('Activated workflow:', activatedWorkflow);

	// Deactivate a workflow
	const deactivatedWorkflow = await client.callTool(
		'deactivate_workflow',
		{
			id: workflow.id,
		},
	);
	console.log('Deactivated workflow:', deactivatedWorkflow);

	// List executions
	const executions = await client.callTool('list_executions', {
		workflowId: workflow.id,
	});
	console.log('Executions:', executions);

	// Get an execution
	if (executions.length > 0) {
		const execution = await client.callTool('get_execution', {
			id: executions[0].id,
		});
		console.log('Execution:', execution);
	}

	// Delete a workflow
	const deletedWorkflow = await client.callTool('delete_workflow', {
		id: workflow.id,
	});
	console.log('Deleted workflow:', deletedWorkflow);
}

main().catch(console.error);
```

## Error Handling

The MCP server uses Zod for schema validation to ensure that the data
sent to and received from the n8n API is valid. If there is a
validation error, the server will return an error message with details
about the validation failure.

For example, if you try to create a workflow without specifying a
name, you will get an error like:

```json
{
	"error": "Validation error: Required at workflow.name"
}
```

The server also handles errors from the n8n API and returns them in a
consistent format:

```json
{
	"error": "n8n API error (404): Workflow not found"
}
```

## Best Practices

Here are some best practices for using the MCP server:

1. **Use descriptive workflow names**: Use clear and descriptive names
   for your workflows to make them easier to find and understand.

2. **Add error handling**: Add error handling to your workflows to
   handle failures gracefully.

3. **Use tags**: Use tags to organize your workflows and make them
   easier to find.

4. **Monitor executions**: Regularly check the executions of your
   workflows to ensure they are running as expected.

5. **Keep workflows simple**: Keep your workflows focused on a single
   task to make them easier to understand and maintain.

6. **Document your workflows**: Add comments and documentation to your
   workflows to make them easier to understand.

7. **Test workflows before activating**: Test your workflows
   thoroughly before activating them to ensure they work as expected.

8. **Use environment variables**: Use environment variables for
   sensitive information like API keys and passwords.

9. **Backup your workflows**: Regularly backup your workflows to
   prevent data loss.

10. **Update n8n and the MCP server**: Keep n8n and the MCP server
    updated to benefit from the latest features and security fixes.
