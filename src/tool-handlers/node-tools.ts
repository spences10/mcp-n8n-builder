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
 */
export async function handle_list_available_nodes() {
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

		// Create a summary of available nodes
		const summary =
			`Found ${nodes.length} available nodes in the n8n instance.\n\n` +
			`When creating workflows, use these exact node types to ensure compatibility.\n\n` +
			`Available nodes by category:\n\n` +
			Object.entries(grouped_nodes)
				.map(([category, nodes]) => {
					return (
						`## ${category}\n\n` +
						nodes
							.map(
								(node) =>
									`- \`${node.name}\`: ${node.display_name}${
										node.description ? ` - ${node.description}` : ''
									}`,
							)
							.join('\n')
					);
				})
				.join('\n\n');

		return {
			content: [
				{
					type: 'text',
					text: summary,
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
