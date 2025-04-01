# Setup Guide

This document provides a guide on how to set up the n8n Workflow
Builder MCP server.

## Prerequisites

Before setting up the MCP server, you need to have:

1. Node.js (v16 or later) installed
2. An n8n instance running and accessible via its REST API
3. An API key for the n8n instance

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

## Installing the MCP Server

1. Clone the repository:

```bash
git clone https://github.com/yourusername/mcp-n8n-builder.git
cd mcp-n8n-builder
```

2. Install dependencies:

```bash
pnpm install
```

3. Build the project:

```bash
pnpm run build
```

## Configuring the MCP Server

The MCP server can be configured using environment variables. The most
important ones are:

- `N8N_HOST`: The URL of your n8n API (default:
  `http://localhost:5678/api/v1`)
- `N8N_API_KEY`: Your n8n API key

### Important Notes About Configuration

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

You can set these environment variables in several ways:

### Using a .env file

Create a `.env` file in the root of the project:

```
N8N_HOST=http://localhost:5678/api/v1
N8N_API_KEY=your-api-key
```

### Using environment variables directly

```bash
export N8N_HOST=http://localhost:5678/api/v1
export N8N_API_KEY=your-api-key
```

### Using the command line

```bash
N8N_HOST=http://localhost:5678/api/v1 N8N_API_KEY=your-api-key pnpm start
```

## Running the MCP Server

Once you've configured the MCP server, you can start it:

```bash
pnpm start
```

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

### For Claude Web App

Edit the Claude web app MCP settings file:

```json
{
	"mcpServers": {
		"n8n-workflow-builder": {
			"command": "node",
			"args": ["/path/to/mcp-n8n-builder/dist/index.js"],
			"env": {
				"N8N_HOST": "http://localhost:5678/api/v1",
				"N8N_API_KEY": "your-api-key"
			}
		}
	}
}
```

## Verifying the Setup

To verify that the MCP server is set up correctly:

1. Start the MCP server
2. Start Claude
3. Ask Claude to list all workflows in your n8n instance:

```
Can you list all workflows in my n8n instance?
```

Claude should use the `list_workflows` tool to fetch all workflows
from your n8n instance.

## Troubleshooting

### Connection Issues

If Claude can't connect to the MCP server, check:

1. The MCP server is running
2. The path to the MCP server in the Claude configuration is correct
3. The environment variables are set correctly

### Authentication Issues

If the MCP server can't authenticate with the n8n API, check:

1. The `N8N_API_KEY` environment variable is set correctly
2. The API key is valid and has not expired
3. The n8n instance is running and accessible

### API Version Issues

If you're using a different version of n8n, the API endpoints might be
different. Check:

1. The `N8N_HOST` environment variable includes the correct API
   version
2. The n8n API documentation for your version to ensure compatibility
