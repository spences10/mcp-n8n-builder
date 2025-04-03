/**
 * Node tools for the n8n workflow builder
 *
 * These tools provide information about available nodes in the n8n instance.
 */

import { node_validator } from '../node-validator.js';

/**
 * Handles the list_available_nodes tool
 *
 * This tool returns a list of all available nodes in the n8n instance.
 * LLMs should use this before creating workflows to ensure they only use valid nodes.
 *
 * @param params Tool parameters
 * @param params.verbosity Output verbosity level (default: 'concise')
 * @param params.category Optional category filter
 */
export async function handle_list_available_nodes(
	params: {
		verbosity?: 'concise' | 'summary' | 'full';
		category?: string;
	} = {},
) {
	try {
		const nodes = await node_validator.get_available_nodes();

		// Sort nodes by name for easier reading
		nodes.sort((a, b) => a.name.localeCompare(b.name));

		// Group nodes by category for better organization
		const grouped_nodes: Record<string, any[]> = {};

		for (const node of nodes) {
			// Extract category from node name (e.g., "n8n-nodes-base.httpRequest" -> "n8n-nodes-base")
			const parts = node.name.split('.');
			const category = parts.length > 1 ? parts[0] : 'other';

			if (!grouped_nodes[category]) {
				grouped_nodes[category] = [];
			}

			grouped_nodes[category].push({
				name: node.name,
				display_name: node.display_name,
				description: node.description,
			});
		}

		// Filter by category if specified
		let filtered_categories = Object.entries(grouped_nodes);
		if (params.category) {
			filtered_categories = filtered_categories.filter(
				([category]) =>
					category.toLowerCase() === params.category?.toLowerCase(),
			);
		}

		// Determine verbosity level
		const verbosity = params.verbosity || 'concise';

		let output = '';

		// Create header
		output += `Found ${nodes.length} available nodes in the n8n instance.\n\n`;
		output += `When creating workflows, use these exact node types to ensure compatibility.\n\n`;

		// For summary mode, just show counts by category
		if (verbosity === 'summary') {
			output += `Node counts by category:\n\n`;
			filtered_categories.forEach(([category, nodes]) => {
				output += `- ${category}: ${nodes.length} nodes\n`;
			});
			return {
				content: [{ type: 'text', text: output }],
			};
		}

		// For concise or full mode, show nodes by category
		output += `Available nodes by category:\n\n`;

		output += filtered_categories
			.map(([category, nodes]) => {
				return (
					`## ${category}\n\n` +
					nodes
						.map((node) => {
							if (verbosity === 'full') {
								return `- \`${node.name}\`: ${node.display_name}${
									node.description ? ` - ${node.description}` : ''
								}`;
							} else {
								// Concise mode - just show name and display name
								return `- \`${node.name}\`: ${node.display_name}`;
							}
						})
						.join('\n')
				);
			})
			.join('\n\n');

		return {
			content: [
				{
					type: 'text',
					text: output,
				},
			],
		};
	} catch (error: any) {
		return {
			content: [
				{
					type: 'text',
					text: `Error listing available nodes: ${
						error.message || String(error)
					}`,
				},
			],
			isError: true,
		};
	}
}
