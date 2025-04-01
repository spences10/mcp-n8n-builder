# n8n API Endpoints for Workflow Management

This document provides a summary of the n8n API endpoints for workflow
management, which are used by the MCP server to interact with n8n.

## Authentication

The n8n API uses API keys for authentication. You need to include the
API key in the `X-N8N-API-KEY` header for all requests.

```
X-N8N-API-KEY: your-api-key
```

## Base URL

The base URL for the n8n API is:

```
http://localhost:5678/api/v1
```

**Important Note**: The correct format for the n8n API endpoint is
`/api/v1`. Do NOT include `/settings` in the path (e.g.,
`https://your-n8n-instance.com/settings/api/v1` will not work).

You can configure a different base URL using the `N8N_HOST`
environment variable.

## Workflow Management Endpoints

### List Workflows

```
GET /workflows
```

Query parameters:

- `active` (boolean): Filter by active status
- `tags` (string): Filter by tags (comma-separated)
- `name` (string): Filter by workflow name

Response:

```json
{
	"data": [
		{
			"id": "2tUt1wbLX592XDdX",
			"name": "Workflow 1",
			"active": true,
			"createdAt": "2019-08-24T14:15:22Z",
			"updatedAt": "2019-08-24T14:15:22Z",
			"tags": [
				{
					"id": "2tUt1wbLX592XDdX",
					"name": "Production"
				}
			]
		}
	],
	"nextCursor": "MTIzZTQ1NjctZTg5Yi0xMmQzLWE0NTYtNDI2NjE0MTc0MDA"
}
```

### Create Workflow

```
POST /workflows
```

Request body:

```json
{
	"name": "Workflow 1",
	"nodes": [
		{
			"id": "1",
			"name": "Start",
			"type": "n8n-nodes-base.start",
			"position": [100, 100],
			"parameters": {}
		}
	],
	"connections": {
		"Start": {
			"main": [
				[
					{
						"node": "End",
						"type": "main",
						"index": 0
					}
				]
			]
		}
	},
	"settings": {
		"saveExecutionProgress": true,
		"saveManualExecutions": true,
		"saveDataErrorExecution": "all",
		"saveDataSuccessExecution": "all",
		"executionTimeout": 3600,
		"timezone": "America/New_York"
	}
}
```

Response:

```json
{
  "id": "2tUt1wbLX592XDdX",
  "name": "Workflow 1",
  "active": false,
  "createdAt": "2019-08-24T14:15:22Z",
  "updatedAt": "2019-08-24T14:15:22Z",
  "nodes": [...],
  "connections": {...},
  "settings": {...},
  "tags": []
}
```

### Get Workflow

```
GET /workflows/{id}
```

Response:

```json
{
  "id": "2tUt1wbLX592XDdX",
  "name": "Workflow 1",
  "active": true,
  "createdAt": "2019-08-24T14:15:22Z",
  "updatedAt": "2019-08-24T14:15:22Z",
  "nodes": [...],
  "connections": {...},
  "settings": {...},
  "tags": [...]
}
```

### Update Workflow

```
PUT /workflows/{id}
```

Request body: Same as Create Workflow

Response: Same as Get Workflow

### Delete Workflow

```
DELETE /workflows/{id}
```

Response: Same as Get Workflow

### Activate Workflow

```
POST /workflows/{id}/activate
```

Response: Same as Get Workflow with `active: true`

### Deactivate Workflow

```
POST /workflows/{id}/deactivate
```

Response: Same as Get Workflow with `active: false`

## Execution Management Endpoints

### List Executions

```
GET /executions
```

Query parameters:

- `workflowId` (string): Filter by workflow ID
- `status` (string): Filter by status (error, success, waiting)
- `limit` (number): Maximum number of executions to return

Response:

```json
{
	"data": [
		{
			"id": 1000,
			"finished": true,
			"mode": "manual",
			"startedAt": "2019-08-24T14:15:22Z",
			"stoppedAt": "2019-08-24T14:15:22Z",
			"workflowId": "2tUt1wbLX592XDdX",
			"workflowData": {
				"id": "2tUt1wbLX592XDdX",
				"name": "Workflow 1"
			}
		}
	],
	"nextCursor": "MTIzZTQ1NjctZTg5Yi0xMmQzLWE0NTYtNDI2NjE0MTc0MDA"
}
```

### Get Execution

```
GET /executions/{id}
```

Query parameters:

- `includeData` (boolean): Whether to include execution data

Response:

```json
{
  "id": 1000,
  "data": {...},
  "finished": true,
  "mode": "manual",
  "startedAt": "2019-08-24T14:15:22Z",
  "stoppedAt": "2019-08-24T14:15:22Z",
  "workflowId": "2tUt1wbLX592XDdX",
  "workflowData": {
    "id": "2tUt1wbLX592XDdX",
    "name": "Workflow 1"
  }
}
```

### Delete Execution

```
DELETE /executions/{id}
```

Response: Same as Get Execution

## Error Handling

The n8n API returns standard HTTP status codes to indicate the success
or failure of a request:

- 200 OK: The request was successful
- 201 Created: The resource was created successfully
- 204 No Content: The request was successful but there is no content
  to return
- 400 Bad Request: The request was invalid
- 401 Unauthorized: Authentication failed
- 404 Not Found: The resource was not found
- 500 Internal Server Error: An error occurred on the server

Error responses include a JSON body with an error message:

```json
{
	"message": "Workflow not found"
}
```

## Pagination

The n8n API supports pagination for endpoints that return multiple
items. The pagination is cursor-based, and you can use the `cursor`
parameter to get the next page of results.

Example:

```
GET /workflows?cursor=MTIzZTQ1NjctZTg5Yi0xMmQzLWE0NTYtNDI2NjE0MTc0MDA
```

The response will include a `nextCursor` field if there are more items
to retrieve:

```json
{
  "data": [...],
  "nextCursor": "MTIzZTQ1NjctZTg5Yi0xMmQzLWE0NTYtNDI2NjE0MTc0MDA"
}
```

If there are no more items, the `nextCursor` field will be omitted.
