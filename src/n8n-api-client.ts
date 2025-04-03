/**
 * n8n API Client
 *
 * This module provides a client for interacting with the n8n REST API.
 */

interface N8nApiClientOptions {
	base_url: string;
	api_key: string;
}

interface ListWorkflowsOptions {
	active?: boolean;
	tags?: string;
	name?: string;
}

interface ListExecutionsOptions {
	workflowId?: string;
	status?: 'error' | 'success' | 'waiting';
	limit?: number;
}

export class N8nApiClient {
	private base_url: string;
	private api_key: string;

	constructor(options: N8nApiClientOptions) {
		this.base_url = options.base_url;
		this.api_key = options.api_key;
	}

	/**
	 * Make an HTTP request to the n8n API
	 */
	private async request<T>(
		method: string,
		endpoint: string,
		data?: any,
	): Promise<T> {
		const url = `${this.base_url}/api/v1${endpoint}`;

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
				throw new Error(
					`n8n API error (${response.status}): ${error_text}`,
				);
			}

			// For DELETE requests that return 204 No Content
			if (response.status === 204) {
				return {} as T;
			}

			return (await response.json()) as T;
		} catch (error) {
			if (error instanceof Error) {
				throw error;
			}
			throw new Error(`Network error: ${String(error)}`);
		}
	}

	/**
	 * List all workflows
	 */
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

	/**
	 * Create a new workflow
	 */
	async create_workflow(
		workflow: any,
		activate?: boolean,
	): Promise<any> {
		const response = await this.request<any>(
			'POST',
			'/workflows',
			workflow,
		);

		if (activate && response.id) {
			await this.activate_workflow(response.id);
			response.active = true;
		}

		return response;
	}

	/**
	 * Get a workflow by ID
	 */
	async get_workflow(id: string): Promise<any> {
		return this.request<any>('GET', `/workflows/${id}`);
	}

	/**
	 * Update a workflow
	 */
	async update_workflow(id: string, workflow: any): Promise<any> {
		return this.request<any>('PUT', `/workflows/${id}`, workflow);
	}

	/**
	 * Delete a workflow
	 */
	async delete_workflow(id: string): Promise<any> {
		return this.request<any>('DELETE', `/workflows/${id}`);
	}

	/**
	 * Activate a workflow
	 */
	async activate_workflow(id: string): Promise<any> {
		return this.request<any>('POST', `/workflows/${id}/activate`);
	}

	/**
	 * Deactivate a workflow
	 */
	async deactivate_workflow(id: string): Promise<any> {
		return this.request<any>('POST', `/workflows/${id}/deactivate`);
	}

	/**
	 * List all executions
	 */
	async list_executions(
		options?: ListExecutionsOptions,
	): Promise<any> {
		let endpoint = '/executions';

		if (options) {
			const params = new URLSearchParams();

			if (options.workflowId) {
				params.append('workflowId', options.workflowId);
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

	/**
	 * Get an execution by ID
	 */
	async get_execution(
		id: string,
		include_data?: boolean,
	): Promise<any> {
		let endpoint = `/executions/${id}`;

		if (include_data !== undefined) {
			endpoint += `?includeData=${include_data}`;
		}

		return this.request<any>('GET', endpoint);
	}

	/**
	 * Delete an execution
	 */
	async delete_execution(id: string): Promise<any> {
		return this.request<any>('DELETE', `/executions/${id}`);
	}
}
