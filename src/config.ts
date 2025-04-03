import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Get package information
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pkg = JSON.parse(
	readFileSync(join(__dirname, '..', 'package.json'), 'utf8'),
);
const { name, version } = pkg;

// Configuration from environment variables
export const config = {
	// n8n API configuration
	n8n_host: process.env.N8N_HOST || 'http://localhost:5678',
	n8n_api_key: process.env.N8N_API_KEY || '',

	// MCP server configuration
	server_name: name,
	server_version: version,

	// Logging configuration
	log_level: process.env.LOG_LEVEL || 'info',

	// Cache configuration
	cache_enabled: process.env.CACHE_ENABLED === 'true',
	cache_ttl: parseInt(process.env.CACHE_TTL || '300', 10),

	// Output configuration
	// Controls how verbose the tool output is
	// 'concise' - Only includes essential information (default)
	// 'full' - Includes all details including full JSON responses
	output_verbosity: process.env.OUTPUT_VERBOSITY || 'concise',
};
