# Setup and Usage Guide

This document provides a guide on how to set up and use the n8n
Workflow Builder MCP server.

## Prerequisites

Before using the MCP server, you need to have:

1. An n8n instance running and accessible via its REST API
2. An API key for the n8n instance

## Installing n8n

If you don't already have an n8n instance running, you can install it
using one of the following methods:

### Using npm

```bash
npm install n8n -g
n8n start
```

### Using Docker

```bash
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

For more installation options, see the
[n8n documentation](https://docs.n8n.io/getting-started/installation/).

## Getting an n8n API Key

To get an API key for your n8n instance:

1. Open your n8n instance in a web browser (default:
   http://localhost:5678)
2. Click on your user avatar in the top-right corner
3. Select "Settings" from the dropdown menu
4. Go to the "API" tab
5. Click "Create API Key"
6. Enter a name for your API key (e.g., "MCP Server")
7. Click "Generate"
8. Copy the generated API key (you won't be able to see it again)

## Configuring Claude to Use the MCP Server

Most users will interact with this tool through MCP configuration
files rather than direct installation. To configure Claude to use the
MCP server, you need to add it to the MCP settings file:

### For Claude Desktop App

Edit the Claude desktop configuration file:

- macOS:
  `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- Linux: `~/.config/Claude/claude_desktop_config.json`

Add the following to the `mcpServers` object:

```json
"n8n-workflow-builder": {
  "command": "npx",
  "args": [
    "-y",
    "mcp-n8n-builder"
  ],
  "env": {
    "N8N_HOST": "https://your-n8n-instance.com/api/v1",
    "N8N_API_KEY": "your-api-key",
    "OUTPUT_VERBOSITY": "concise"
  }
}
```

### For WSL Users

If you are a WSL user, you need to have a config that uses the
`wsl.exe` binary to pass to Linux bash:

```json
"n8n-workflow-builder": {
  "command": "wsl.exe",
  "args": [
    "bash",
    "-c",
    "N8N_HOST=https://your-n8n-instance.com/api/v1 N8N_API_KEY=your-api-key OUTPUT_VERBOSITY=concise npx -y mcp-n8n-builder"
  ]
}
```

### Important Configuration Notes

1. **API Endpoint Format**:

   - The correct format for the n8n API endpoint is `/api/v1` (e.g.,
     `https://your-n8n-instance.com/api/v1`)
   - Do NOT include `/settings` in the path (e.g.,
     `https://your-n8n-instance.com/settings/api/v1` will not work)

2. **Workflow Activation Requirements**:
   - To activate a workflow, it must contain at least one trigger node
     that can automatically start the workflow
   - Valid trigger nodes include schedule triggers, webhook nodes, and
     other event-based triggers
   - Workflows with only manual triggers cannot be activated

### Output Verbosity Configuration

The MCP server supports two output verbosity modes:

- **concise** (default): Only includes essential information in the
  output, preserving context window space when used with AI assistants
  like Claude.
- **full**: Includes all details including full JSON responses, useful
  for debugging or when you need complete information.

This setting affects how verbose the output is for all MCP tools and
resources. When working with large workflows or many executions, using
the 'concise' mode can significantly reduce the amount of context
window space consumed.

You can control the verbosity by setting the `OUTPUT_VERBOSITY`
environment variable in your MCP configuration.

## Using the MCP Server with Claude

Once the MCP server is configured, you can use it with Claude to
create and manage n8n workflows.

### Verifying the Setup

To verify that the MCP server is set up correctly, ask Claude:

```
Can you list all workflows in my n8n instance?
```

Claude should use the `list_workflows` tool to fetch all workflows
from your n8n instance.

### Common Usage Examples

Here are some examples of how to use the MCP server with Claude:

#### Listing Workflows

```
Can you list all workflows in my n8n instance?
```

#### Creating a Workflow

```
Can you create a workflow that fetches data from an API and sends it to a Slack channel?
```

#### Creating Workflows with Different Trigger Types

1. **Manual Trigger Workflows**:

   ```
   Can you create a workflow with a manual trigger that fetches a random joke?
   ```

   - These workflows can only be started manually
   - They cannot be activated for automatic execution

2. **Schedule Trigger Workflows**:

   ```
   Can you create a workflow that runs every hour to fetch weather data?
   ```

   - These workflows run automatically on a schedule
   - They can be activated for automatic execution

3. **Webhook Trigger Workflows**:
   ```
   Can you create a workflow that listens for GitHub webhook events?
   ```
   - These workflows run when they receive an HTTP request
   - They can be activated for automatic execution

#### Updating a Workflow

```
Can you update the "API to Slack" workflow to add error handling?
```

#### Activating/Deactivating a Workflow

```
Can you activate the "API to Slack" workflow?
```

```
Can you deactivate the "API to Slack" workflow?
```

#### Deleting a Workflow

```
Can you delete the "Test Workflow" workflow?
```

#### Viewing Executions

```
Can you show me the recent executions of the "API to Slack" workflow?
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
