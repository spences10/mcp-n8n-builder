/**
 * Node Validator Service
 *
 * This module provides functionality to validate n8n node types by checking
 * against the actual nodes available in the n8n instance.
 */

import { config } from './config.js';
import { N8nApiClient } from './n8n-api-client.js';

// Cache duration in milliseconds (default: 1 hour)
const CACHE_DURATION = 60 * 60 * 1000;

interface NodeInfo {
	name: string;
	display_name: string;
	description?: string;
	type?: string;
	version?: number;
}

export class NodeValidator {
	private node_registry: Map<string, NodeInfo> = new Map();
	private last_fetch_time: number = 0;
	private is_fetching: boolean = false;
	private fetch_promise: Promise<void> | null = null;
	private api_client: N8nApiClient;

	constructor() {
		this.api_client = new N8nApiClient({
			base_url: config.n8n_host,
			api_key: config.n8n_api_key,
		});
	}

	/**
	 * Validates if a node type exists in n8n
	 *
	 * @param node_type The node type to validate
	 * @returns A promise that resolves to a validation result
	 */
	async validate_node_type(
		node_type: string,
	): Promise<{ valid: boolean; suggestion?: string }> {
		await this.ensure_node_registry_is_loaded();

		// Check if the node type exists in our registry
		if (this.node_registry.has(node_type)) {
			return { valid: true };
		}

		// If not found, try to find a similar node type as a suggestion
		const suggestion = this.find_similar_node_type(node_type);
		return {
			valid: false,
			suggestion: suggestion ? suggestion : undefined,
		};
	}

	/**
	 * Validates all nodes in a workflow
	 *
	 * @param nodes Array of workflow nodes to validate
	 * @returns A promise that resolves to an array of validation errors
	 */
	async validate_workflow_nodes(
		nodes: Array<{ type: string }>,
	): Promise<Array<{ node_type: string; suggestion?: string }>> {
		await this.ensure_node_registry_is_loaded();

		const invalid_nodes: Array<{
			node_type: string;
			suggestion?: string;
		}> = [];

		for (const node of nodes) {
			const validation = await this.validate_node_type(node.type);
			if (!validation.valid) {
				invalid_nodes.push({
					node_type: node.type,
					suggestion: validation.suggestion,
				});
			}
		}

		return invalid_nodes;
	}

	/**
	 * Gets a list of all available node types
	 *
	 * @returns A promise that resolves to an array of node types
	 */
	async get_available_node_types(): Promise<string[]> {
		await this.ensure_node_registry_is_loaded();
		return Array.from(this.node_registry.keys());
	}

	/**
	 * Gets detailed information about all available nodes
	 *
	 * @returns A promise that resolves to an array of node info objects
	 */
	async get_available_nodes(): Promise<NodeInfo[]> {
		await this.ensure_node_registry_is_loaded();
		return Array.from(this.node_registry.values());
	}

	/**
	 * Ensures the node registry is loaded and up-to-date
	 */
	private async ensure_node_registry_is_loaded(): Promise<void> {
		const now = Date.now();

		// If we're already fetching, wait for that to complete
		if (this.is_fetching && this.fetch_promise) {
			return this.fetch_promise;
		}

		// If the cache is still valid, use it
		if (
			this.node_registry.size > 0 &&
			now - this.last_fetch_time < CACHE_DURATION
		) {
			return;
		}

		// Otherwise, fetch the node registry
		this.is_fetching = true;
		this.fetch_promise = this.fetch_node_registry();

		try {
			await this.fetch_promise;
		} finally {
			this.is_fetching = false;
			this.fetch_promise = null;
		}
	}

	/**
	 * Fetches the node registry from the n8n API
	 */
	private async fetch_node_registry(): Promise<void> {
		try {
			// Fetch the list of available nodes from the n8n API
			const response = await fetch(`${config.n8n_host}/node-types`, {
				headers: {
					Accept: 'application/json',
					'X-N8N-API-KEY': config.n8n_api_key,
				},
			});

			if (!response.ok) {
				throw new Error(
					`n8n API error: ${response.status} ${response.statusText}`,
				);
			}

			const data = await response.json();

			// Clear the existing registry
			this.node_registry.clear();

			// Process the nodes
			if (data && Array.isArray(data.data)) {
				for (const node of data.data) {
					if (node.name) {
						this.node_registry.set(node.name, {
							name: node.name,
							display_name: node.displayName || node.name,
							description: node.description,
							type: node.type,
							version: node.version,
						});
					}
				}
			}

			// Update the last fetch time
			this.last_fetch_time = Date.now();

			console.log(
				`Node registry loaded with ${this.node_registry.size} node types from n8n API`,
			);
		} catch (error) {
			console.error(
				'Error fetching node registry from n8n API:',
				error,
			);

			// If we failed to fetch, but have a cached registry, keep using it
			if (this.node_registry.size === 0) {
				// If we have no registry at all, add fallback nodes
				this.add_fallback_nodes();
				this.last_fetch_time = Date.now();
			}
		}
	}

	/**
	 * Adds fallback nodes to the registry
	 * This is used when the n8n API is unavailable
	 */
	private add_fallback_nodes(): void {
		console.warn(
			'Using fallback node list. This may not match your n8n instance.',
		);

		// Common n8n nodes - this is just a fallback and may not match the actual instance
		const fallback_nodes = [
			{ name: 'n8n-nodes-base.start', display_name: 'Start' },
			{
				name: 'n8n-nodes-base.manualTrigger',
				display_name: 'Manual Trigger',
			},
			{
				name: 'n8n-nodes-base.httpRequest',
				display_name: 'HTTP Request',
			},
			{ name: 'n8n-nodes-base.set', display_name: 'Set' },
			{ name: 'n8n-nodes-base.function', display_name: 'Function' },
			{ name: 'n8n-nodes-base.if', display_name: 'IF' },
			{ name: 'n8n-nodes-base.switch', display_name: 'Switch' },
			{ name: 'n8n-nodes-base.merge', display_name: 'Merge' },
		];

		for (const node of fallback_nodes) {
			this.node_registry.set(node.name, {
				name: node.name,
				display_name: node.display_name,
			});
		}
	}

	/**
	 * Finds a similar node type as a suggestion
	 */
	private find_similar_node_type(node_type: string): string | null {
		let best_match: string | null = null;
		let best_score = 0;

		for (const existing_type of this.node_registry.keys()) {
			const score = this.calculate_similarity(
				node_type,
				existing_type,
			);
			if (score > best_score && score > 0.6) {
				// Threshold for similarity
				best_score = score;
				best_match = existing_type;
			}
		}

		return best_match;
	}

	/**
	 * Calculates the similarity between two strings
	 * Uses Levenshtein distance and length comparison
	 */
	private calculate_similarity(a: string, b: string): number {
		// Convert both strings to lowercase for case-insensitive comparison
		const s1 = a.toLowerCase();
		const s2 = b.toLowerCase();

		// Calculate Levenshtein distance
		const distance = this.levenshtein_distance(s1, s2);
		const max_length = Math.max(s1.length, s2.length);

		// Convert distance to similarity score (0-1)
		return 1 - distance / max_length;
	}

	/**
	 * Calculates the Levenshtein distance between two strings
	 */
	private levenshtein_distance(a: string, b: string): number {
		const matrix: number[][] = [];

		// Initialize the matrix
		for (let i = 0; i <= a.length; i++) {
			matrix[i] = [i];
		}

		for (let j = 0; j <= b.length; j++) {
			matrix[0][j] = j;
		}

		// Fill the matrix
		for (let i = 1; i <= a.length; i++) {
			for (let j = 1; j <= b.length; j++) {
				const cost = a[i - 1] === b[j - 1] ? 0 : 1;
				matrix[i][j] = Math.min(
					matrix[i - 1][j] + 1, // deletion
					matrix[i][j - 1] + 1, // insertion
					matrix[i - 1][j - 1] + cost, // substitution
				);
			}
		}

		return matrix[a.length][b.length];
	}
}

// Create a singleton instance
export const node_validator = new NodeValidator();
