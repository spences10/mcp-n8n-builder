# n8n API Client Implementation

This document provides an overview of the n8n API client
implementation in the MCP server.

## Overview

The n8n API client is a TypeScript class that provides methods for
interacting with the n8n REST API. It handles authentication, request
formatting, and response parsing.

## Configuration

The client is configured using the following environment variables:

- `N8N_HOST`: The URL of the n8n API (default:
  `http://localhost:5678/api/v1`)
- `N8N_API_KEY`: The API key for n8n authentication

**Important Note**: The correct format for the n8n API endpoint is
`/api/v1`. Do NOT include `/settings` in the path (e.g.,
`https://your-n8n-instance.com/settings/api/v1` will not work).

## Class Structure

The `N8nApiClient` class is defined in `src/n8n-api-client.ts` and has
the following structure:

```typescript
export class N8nApiClient {
	private base_url: string;
	private api_key: string;

	constructor(options: N8nApiClientOptions) {
		this.base_url = options.base_url;
		this.api_key = options.api_key;
	}

	// Private methods
	private async request<T>(
		method: string,
		endpoint: string,
		data?: any,
	): Promise<T>;

	// Public methods
	async list_workflows(options?: ListWorkflowsOptions): Promise<any>;
	async create_workflow(
		workflow: any,
		activate?: boolean,
	): Promise<any>;
	async get_workflow(id: string): Promise<any>;
	async update_workflow(id: string, workflow: any): Promise<any>;
	async delete_workflow(id: string): Promise<any>;
	async activate_workflow(id: string): Promise<any>;
	async deactivate_workflow(id: string): Promise<any>;
	async list_executions(
		options?: ListExecutionsOptions,
	): Promise<any>;
	async get_execution(
		id: string,
		include_data?: boolean,
	): Promise<any>;
	async delete_execution(id: string): Promise<any>;
}
```

## Request Method

The `request` method is a private method that handles HTTP requests to
the n8n API. It takes the following parameters:

- `method`: The HTTP method to use (GET, POST, PUT, DELETE)
- `endpoint`: The API endpoint to call
- `data`: Optional data to send with the request

It returns a Promise that resolves to the response data.

```typescript
private async request<T>(
  method: string,
  endpoint: string,
  data?: any
): Promise<T> {
  const url = `${this.base_url}${endpoint}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (this.api_key) {
    headers['X-N8N-API-KEY'] = this.api_key;
  }

  const options: RequestInit = {
    method,
    headers,
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const error_text = await response.text();
      throw new Error(`n8n API error (${response.status}): ${error_text}`);
    }

    // For DELETE requests that return 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return await response.json() as T;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Network error: ${String(error)}`);
  }
}
```

## Workflow Management Methods

### List Workflows

The `list_workflows` method retrieves a list of workflows from the n8n
API. It takes an optional `options` parameter that can include filters
for active status, tags, and name.

```typescript
async list_workflows(options?: ListWorkflowsOptions): Promise<any> {
  let endpoint = '/workflows';

  if (options) {
    const params = new URLSearchParams();

    if (options.active !== undefined) {
      params.append('active', String(options.active));
    }

    if (options.tags) {
      params.append('tags', options.tags);
    }

    if (options.name) {
      params.append('name', options.name);
    }

    const query_string = params.toString();
    if (query_string) {
      endpoint += `?${query_string}`;
    }
  }

  const response = await this.request<any>('GET', endpoint);
  return response.data || response;
}
```

### Create Workflow

The `create_workflow` method creates a new workflow in the n8n API. It
takes a workflow object and an optional `activate` parameter that
determines whether the workflow should be activated after creation.

```typescript
async create_workflow(workflow: any, activate?: boolean): Promise<any> {
  const response = await this.request<any>('POST', '/workflows', workflow);

  if (activate && response.id) {
    await this.activate_workflow(response.id);
    response.active = true;
  }

  return response;
}
```

### Get Workflow

The `get_workflow` method retrieves a workflow by its ID.

```typescript
async get_workflow(id: string): Promise<any> {
  return this.request<any>('GET', `/workflows/${id}`);
}
```

### Update Workflow

The `update_workflow` method updates an existing workflow.

```typescript
async update_workflow(id: string, workflow: any): Promise<any> {
  return this.request<any>('PUT', `/workflows/${id}`, workflow);
}
```

### Delete Workflow

The `delete_workflow` method deletes a workflow by its ID.

```typescript
async delete_workflow(id: string): Promise<any> {
  return this.request<any>('DELETE', `/workflows/${id}`);
}
```

### Activate Workflow

The `activate_workflow` method activates a workflow by its ID.

```typescript
async activate_workflow(id: string): Promise<any> {
  return this.request<any>('POST', `/workflows/${id}/activate`);
}
```

### Deactivate Workflow

The `deactivate_workflow` method deactivates a workflow by its ID.

```typescript
async deactivate_workflow(id: string): Promise<any> {
  return this.request<any>('POST', `/workflows/${id}/deactivate`);
}
```

## Execution Management Methods

### List Executions

The `list_executions` method retrieves a list of workflow executions.
It takes an optional `options` parameter that can include filters for
workflow ID, status, and limit.

```typescript
async list_executions(options?: ListExecutionsOptions): Promise<any> {
  let endpoint = '/executions';

  if (options) {
    const params = new URLSearchParams();

    if (options.workflow_id) {
      params.append('workflowId', options.workflow_id);
    }

    if (options.status) {
      params.append('status', options.status);
    }

    if (options.limit) {
      params.append('limit', String(options.limit));
    }

    const query_string = params.toString();
    if (query_string) {
      endpoint += `?${query_string}`;
    }
  }

  const response = await this.request<any>('GET', endpoint);
  return response.data || response;
}
```

### Get Execution

The `get_execution` method retrieves an execution by its ID. It takes
an optional `include_data` parameter that determines whether to
include the execution data.

```typescript
async get_execution(id: string, include_data?: boolean): Promise<any> {
  let endpoint = `/executions/${id}`;

  if (include_data !== undefined) {
    endpoint += `?includeData=${include_data}`;
  }

  return this.request<any>('GET', endpoint);
}
```

### Delete Execution

The `delete_execution` method deletes an execution by its ID.

```typescript
async delete_execution(id: string): Promise<any> {
  return this.request<any>('DELETE', `/executions/${id}`);
}
```

## Error Handling

The client handles errors by throwing exceptions with descriptive
error messages. The error messages include the HTTP status code and
the error message from the n8n API.

For example, if the n8n API returns a 404 Not Found error, the client
will throw an exception with the message:

```
n8n API error (404): Workflow not found
```

If there is a network error, the client will throw an exception with
the message:

```
Network error: [error message]
```

## Usage

The client is used by the MCP server to interact with the n8n API. It
is instantiated with the base URL and API key, and then its methods
are called to perform operations on workflows and executions.

```typescript
const client = new N8nApiClient({
  base_url: 'http://localhost:5678/api/v1',
  api_key: 'your-api-key',
});

// List all workflows
const workflows = await client.list_workflows();

// Create a new workflow
const workflow = await client.create_workflow({
  name: 'My Workflow',
  nodes: [...],
  connections: {...},
  settings: {...},
}, true);

// Get a workflow
const workflow = await client.get_workflow('workflow-id');

// Update a workflow
const workflow = await client.update_workflow('workflow-id', {
  name: 'My Updated Workflow',
  nodes: [...],
  connections: {...},
  settings: {...},
});

// Delete a workflow
const workflow = await client.delete_workflow('workflow-id');

// Activate a workflow
const workflow = await client.activate_workflow('workflow-id');

// Deactivate a workflow
const workflow = await client.deactivate_workflow('workflow-id');

// List executions
const executions = await client.list_executions({
  workflow_id: 'workflow-id',
  status: 'success',
  limit: 10,
});

// Get an execution
const execution = await client.get_execution('execution-id', true);

// Delete an execution
const execution = await client.delete_execution('execution-id');
```
