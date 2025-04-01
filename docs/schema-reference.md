# Schema Reference

This document provides a reference for the schema validation used by
the MCP server. The server uses
[Zod](https://github.com/colinhacks/zod) for schema validation to
ensure that the data sent to and received from the n8n API is valid.

## Node Schema

The `NodeSchema` defines the structure of a node in an n8n workflow.

```typescript
export const NodeSchema = z.object({
	id: z.string(),
	name: z.string(),
	type: z.string(),
	position: z.array(z.number()).length(2), // n8n API expects position as [x, y] array
	parameters: z.record(z.any()).optional(),
	typeVersion: z.number().optional(),
	credentials: z.record(z.any()).optional(),
});
```

### Properties

- `id` (string, required): The unique identifier of the node
- `name` (string, required): The name of the node
- `type` (string, required): The type of the node (e.g.,
  `n8n-nodes-base.httpRequest`)
- `position` (array, required): The position of the node in the
  workflow editor as an array of two numbers [x, y]
- `parameters` (object, optional): The parameters of the node
- `typeVersion` (number, optional): The version of the node type
- `credentials` (object, optional): The credentials used by the node

## Connection Schema

The `ConnectionSchema` defines the structure of a connection between
nodes in an n8n workflow.

```typescript
export const ConnectionSchema = z.object({
	node: z.string(),
	type: z.string(),
	index: z.number(),
});
```

### Properties

- `node` (string, required): The ID of the target node
- `type` (string, required): The type of the connection (usually
  `main`)
- `index` (number, required): The index of the connection

## Workflow Settings Schema

The `WorkflowSettingsSchema` defines the structure of the settings for
an n8n workflow.

```typescript
export const WorkflowSettingsSchema = z
	.object({
		saveExecutionProgress: z.boolean().optional(),
		saveManualExecutions: z.boolean().optional(),
		saveDataErrorExecution: z.string().optional(),
		saveDataSuccessExecution: z.string().optional(),
		executionTimeout: z.number().optional(),
		errorWorkflow: z.string().optional(),
		timezone: z.string().optional(),
		executionOrder: z.string().optional(),
	})
	.optional();
```

### Properties

- `saveExecutionProgress` (boolean, optional): Whether to save the
  execution progress
- `saveManualExecutions` (boolean, optional): Whether to save manual
  executions
- `saveDataErrorExecution` (string, optional): When to save data for
  failed executions
- `saveDataSuccessExecution` (string, optional): When to save data for
  successful executions
- `executionTimeout` (number, optional): The execution timeout in
  seconds
- `errorWorkflow` (string, optional): The ID of the workflow to
  execute on error
- `timezone` (string, optional): The timezone to use for the workflow
- `executionOrder` (string, optional): The execution order of the
  workflow

## Workflow Schema

The `WorkflowSchema` defines the structure of an n8n workflow.

```typescript
export const WorkflowSchema = z.object({
	id: z.string().optional(),
	name: z.string(),
	active: z.boolean().optional(),
	nodes: z.array(NodeSchema),
	connections: z.record(z.record(z.array(z.array(ConnectionSchema)))),
	settings: WorkflowSettingsSchema,
	staticData: z
		.union([z.string().nullable(), z.record(z.any()).nullable()])
		.optional(),
});
```

### Properties

- `id` (string, optional): The unique identifier of the workflow
- `name` (string, required): The name of the workflow
- `active` (boolean, optional): Whether the workflow is active
- `nodes` (array, required): The nodes in the workflow
- `connections` (object, required): The connections between nodes
- `settings` (object, optional): The settings for the workflow
- `staticData` (string or object, optional): Static data for the
  workflow

## Create Workflow Input Schema

The `CreateWorkflowInputSchema` defines the structure of the input for
creating a workflow.

```typescript
export const CreateWorkflowInputSchema = z.object({
	workflow: WorkflowSchema,
	activate: z.boolean().optional(),
});
```

### Properties

- `workflow` (object, required): The workflow to create
- `activate` (boolean, optional): Whether to activate the workflow
  after creation

## Execution Schema

The `ExecutionSchema` defines the structure of an n8n workflow
execution.

```typescript
export const ExecutionSchema = z.object({
	id: z.number(),
	data: z.any().optional(),
	finished: z.boolean(),
	mode: z.string(),
	retryOf: z.number().optional(),
	retrySuccessId: z.string().optional(),
	startedAt: z.string(),
	stoppedAt: z.string().optional(),
	workflowId: z.string(),
	waitTill: z.string().optional(),
	customData: z.record(z.any()).optional(),
});
```

### Properties

- `id` (number, required): The unique identifier of the execution
- `data` (any, optional): The execution data
- `finished` (boolean, required): Whether the execution has finished
- `mode` (string, required): The execution mode (e.g., `manual`,
  `trigger`)
- `retryOf` (number, optional): The ID of the execution this is a
  retry of
- `retrySuccessId` (string, optional): The ID of the successful retry
- `startedAt` (string, required): The time the execution started
- `stoppedAt` (string, optional): The time the execution stopped
- `workflowId` (string, required): The ID of the workflow
- `waitTill` (string, optional): The time to wait until
- `customData` (object, optional): Custom data for the execution
