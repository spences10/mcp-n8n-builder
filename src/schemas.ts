import { z } from 'zod';

// Node schema
export const NodeSchema = z.object({
	id: z.string(),
	name: z.string(),
	type: z.string(),
	position: z.array(z.number()).length(2), // n8n API expects position as [x, y] array
	parameters: z.record(z.any()).optional(),
	typeVersion: z.number().optional(),
	credentials: z.record(z.any()).optional(),
});

// Connection schema
export const ConnectionSchema = z.object({
	node: z.string(),
	type: z.string(),
	index: z.number(),
});

// Workflow settings schema
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

// Workflow schema
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

// Create workflow input schema
export const CreateWorkflowInputSchema = z.object({
	workflow: WorkflowSchema,
	activate: z.boolean().optional(),
});

// Execution schema
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
