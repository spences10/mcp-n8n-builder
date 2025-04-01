# Using the n8n Workflow Builder MCP Server with Claude

This document provides a guide on how to use the n8n Workflow Builder
MCP server with Claude.

## Prerequisites

Before using the MCP server with Claude, you need to have:

1. An n8n instance running and accessible via its REST API
2. An API key for the n8n instance
3. The MCP server installed and configured
4. Claude configured to use the MCP server

## Configuring Claude to Use the MCP Server

To configure Claude to use the MCP server, you need to add it to the
MCP settings file:

### For Claude Desktop App

Edit the Claude desktop configuration file:

- macOS:
  `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- Linux: `~/.config/Claude/claude_desktop_config.json`

Add the following to the `mcpServers` object:

```json
"n8n-workflow-builder": {
  "command": "node",
  "args": ["/path/to/mcp-n8n-builder/dist/index.js"],
  "env": {
    "N8N_HOST": "http://localhost:5678/api/v1",
    "N8N_API_KEY": "your-api-key"
  }
}
```

## Using the MCP Server with Claude

Once the MCP server is configured, you can use it with Claude to
create and manage n8n workflows. Here are some examples of how to use
the MCP server with Claude:

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

#### Understanding Workflow Trigger Types

When creating workflows, it's important to understand the different
types of triggers and their implications:

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

### Getting a Workflow

You can ask Claude to get a specific workflow:

```
Can you show me the details of the "API to Slack" workflow?
```

Claude will use the `get_workflow` tool to fetch the workflow details.

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

```
Can you deactivate the "API to Slack" workflow?
```

Claude will use the `deactivate_workflow` tool to deactivate the
specified workflow.

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

### Getting Execution Details

You can ask Claude to get the details of a specific execution:

```
Can you show me the details of execution 12345?
```

Claude will use the `get_execution` tool to fetch the execution
details.

### Deleting an Execution

You can ask Claude to delete an execution:

```
Can you delete execution 12345?
```

Claude will use the `delete_execution` tool to delete the specified
execution.

## Example Conversations

Here are some example conversations with Claude using the MCP server:

### Example 1: Creating a Simple Workflow

**User**: Can you create a simple workflow that sends a daily weather
report to Slack?

**Claude**: I'll help you create a workflow that sends a daily weather
report to Slack. Let me use the n8n Workflow Builder to set this up.

First, I'll create a new workflow:

[Claude uses the `create_workflow` tool to create a new workflow with
the following components:

1. A Schedule Trigger node configured to run daily
2. An HTTP Request node to fetch weather data from a weather API
3. A Function node to format the weather data into a readable message
4. A Slack node to send the message to a Slack channel]

I've created a new workflow called "Daily Weather Report" that will:

1. Run automatically at 8:00 AM every day
2. Fetch the current weather data for your location
3. Format it into a readable message
4. Send it to your Slack channel

The workflow has been created but is currently inactive. Would you
like me to activate it now?

**User**: Yes, please activate it.

**Claude**: [Claude uses the `activate_workflow` tool to activate the
workflow]

I've activated the "Daily Weather Report" workflow. It will now run
automatically at 8:00 AM every day and send the weather report to your
Slack channel.

### Example 2: Updating an Existing Workflow

**User**: Can you update my "Daily Weather Report" workflow to include
a 5-day forecast?

**Claude**: I'll update your "Daily Weather Report" workflow to
include a 5-day forecast.

First, let me get the current workflow:

[Claude uses the `get_workflow` tool to fetch the current workflow]

Now I'll update it to include a 5-day forecast:

[Claude uses the `update_workflow` tool to update the workflow with
the following changes:

1. Modify the HTTP Request node to fetch a 5-day forecast
2. Update the Function node to format both the current weather and the
   5-day forecast
3. Update the Slack message format to include the 5-day forecast]

I've updated the "Daily Weather Report" workflow to include a 5-day
forecast. The workflow will now:

1. Fetch both the current weather and a 5-day forecast
2. Format the data into a readable message that includes both
3. Send the enhanced report to your Slack channel

The workflow is still active and will continue to run at 8:00 AM every
day.

## Best Practices

Here are some best practices for using the MCP server with Claude:

1. **Be specific**: When asking Claude to create or update a workflow,
   be as specific as possible about what you want the workflow to do.

2. **Provide context**: If you're asking Claude to update an existing
   workflow, provide context about what the workflow currently does
   and what you want to change.

3. **Review before activating**: When creating or updating workflows,
   review the workflow before activating it to ensure it does what you
   expect.

4. **Use descriptive names**: Use descriptive names for your workflows
   to make them easier to find and understand.

5. **Add error handling**: When creating workflows, consider adding
   error handling to handle failures gracefully.

6. **Test workflows**: Test your workflows thoroughly before using
   them in production.

7. **Monitor executions**: Regularly check the executions of your
   workflows to ensure they are running as expected.

8. **Keep workflows simple**: Keep your workflows focused on a single
   task to make them easier to understand and maintain.

9. **Document your workflows**: Add comments and documentation to your
   workflows to make them easier to understand.

10. **Backup your workflows**: Regularly backup your workflows to
    prevent data loss.
