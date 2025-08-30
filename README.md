[![MseeP.ai Security Assessment Badge](https://mseep.net/pr/spences10-mcp-n8n-builder-badge.png)](https://mseep.ai/app/spences10-mcp-n8n-builder)

# mcp-n8n-builder

A Model Context Protocol (MCP) server for programmatic creation and
management of n8n workflows. This server provides tools and resources
for interacting with n8n's REST API, allowing AI assistants to build,
modify, and manage workflows without direct user intervention.

<a href="https://glama.ai/mcp/servers/@spences10/mcp-n8n-builder">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/@spences10/mcp-n8n-builder/badge" />
</a>

## Features

- 🔄 **Workflow Management**: Create, read, update, delete, activate,
  and deactivate workflows
- 📊 **Execution Management**: List and retrieve workflow execution
  details
- ✅ **Schema Validation**: Comprehensive validation with Zod for both
  input and output data
- 🔍 **Node Validation**: Validates node types against n8n's available
  nodes before workflow creation to prevent errors
- 🤔 **Smart Suggestions**: Provides suggestions for similar node
  types when invalid nodes are detected
- 🛠️ **Error Handling**: Detailed error messages for troubleshooting
- 📝 **Documentation**: Extensive documentation for all tools and
  resources
- 🔍 **Search & Filter**: Filter workflows by name, tags, or active
  status

## ⚠️ Token Consumption Warning

This tool is a "token monster" due to the nature of n8n workflows:

- **N8N workflows are complex JSON structures** with nested nodes, connections, parameters, and settings
- **A single workflow can easily consume thousands of tokens** when viewed or edited
- **The JSON structure cannot be meaningfully reduced** without losing essential workflow information
- **LLM context windows are finite** - complex workflows may exceed available context

### Mitigation Strategies

The tool implements several optimizations to reduce token usage:

- **Verbosity Control**: Use `OUTPUT_VERBOSITY=concise` (default) for summaries instead of full JSON
- **Object Simplification**: Workflow listings show only essential fields (id, name, status, node count)
- **Selective Guide Inclusion**: Error messages include only relevant sections of the composition guide
- **Per-tool Verbosity**: Override verbosity on individual tool calls with the `verbosity` parameter

### Recommended Usage

- **List workflows first** to identify what you need (low token cost)
- **Work with simple workflows** when possible
- **Use `concise` verbosity** unless you specifically need full JSON
- **Break complex workflows into smaller pieces** for easier management
- **Consider the token cost** before retrieving or editing large workflows

## Configuration

This server requires configuration through your MCP client. Here are
examples for different environments:

### Cline Configuration

Add this to your Cline MCP settings:

```json
{
	"mcpServers": {
		"n8n-workflow-builder": {
			"command": "npx",
			"args": ["-y", "mcp-n8n-builder"],
			"env": {
				"N8N_HOST": "http://localhost:5678/api/v1",
				"N8N_API_KEY": "your-n8n-api-key",
				"OUTPUT_VERBOSITY": "concise" // Options: 'concise' or 'full'
			}
		}
	}
}
```

### Claude Desktop with WSL Configuration

For WSL environments, add this to your Claude Desktop configuration:

```json
{
	"mcpServers": {
		"n8n-workflow-builder": {
			"command": "wsl.exe",
			"args": [
				"bash",
				"-c",
				"N8N_HOST=http://localhost:5678/api/v1 N8N_API_KEY=your-n8n-api-key OUTPUT_VERBOSITY=concise npx -y mcp-n8n-builder"
			]
		}
	}
}
```

### Environment Variables

The server can be configured using environment variables:

| Variable           | Description                                  | Default                        |
| ------------------ | -------------------------------------------- | ------------------------------ |
| `N8N_HOST`         | URL of the n8n API                           | `http://localhost:5678/api/v1` |
| `N8N_API_KEY`      | API key for n8n authentication               | `""`                           |
| `SERVER_NAME`      | Name of the MCP server                       | `"n8n-workflow-builder"`       |
| `SERVER_VERSION`   | Version of the MCP server                    | Package version                |
| `LOG_LEVEL`        | Logging level                                | `"info"`                       |
| `CACHE_ENABLED`    | Enable caching                               | `false`                        |
| `CACHE_TTL`        | Cache TTL in seconds                         | `300`                          |
| `OUTPUT_VERBOSITY` | Output verbosity level (`concise` or `full`) | `"concise"`                    |

## MCP Tools

### Node Management

- `list_available_nodes`: Lists all available nodes in the n8n
  instance. **IMPORTANT**: Use this tool BEFORE creating or updating
  workflows to ensure you only use valid node types. This helps
  prevent errors caused by using node types that don't exist in the
  current n8n instance.

### Workflow Management

- `list_workflows`: Lists all workflows from n8n with their basic
  information including ID, name, status, creation date, and tags.
  Results can be filtered by active status, tags, or name.
- `create_workflow`: Creates a new workflow in n8n with specified
  nodes and connections. Returns the created workflow with its
  assigned ID. Validates that all node types exist in the n8n
  instance.
- `get_workflow`: Retrieves complete details of a specific workflow by
  its ID, including all nodes, connections, settings, and metadata.
- `update_workflow`: Updates an existing workflow with new
  configuration. The entire workflow structure must be provided, not
  just the parts being changed. Validates that all node types exist in
  the n8n instance.
- `delete_workflow`: Permanently deletes a workflow by its ID. This
  action cannot be undone.
- `activate_workflow`: Activates a workflow by its ID, enabling it to
  run automatically based on its trigger.
- `deactivate_workflow`: Deactivates a workflow by its ID, preventing
  it from running automatically.

### Execution Management

- `list_executions`: Lists workflow execution history with details on
  success/failure status, duration, and timestamps. Results can be
  filtered by workflow ID, status, and limited to a specific number.
- `get_execution`: Retrieves detailed information about a specific
  workflow execution, including execution time, status, and optionally
  the full data processed at each step.

## MCP Resources

- `n8n://workflows`: List of all workflows in n8n
- `n8n://workflows/{id}`: Details of a specific n8n workflow
- `n8n://executions/{id}`: Details of a specific n8n workflow
  execution

## Development

### Setup

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Build the project:

```bash
npm run build
```

4. Run in development mode:

```bash
npm run dev
```

### Publishing

The project uses changesets for version management. To publish:

1. Create a changeset:

```bash
npm changeset
```

2. Version the package:

```bash
npm changeset version
```

3. Publish to npm:

```bash
npm release
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built on the
  [Model Context Protocol](https://github.com/modelcontextprotocol)
- Powered by [n8n](https://n8n.io/)
