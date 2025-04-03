/**
 * N8N Workflow Composition Guide
 *
 * This guide provides instructions for LLMs on how to effectively compose n8n workflows.
 * It includes best practices, common patterns, and specific guidance for different workflow types.
 */

export const WORKFLOW_COMPOSITION_GUIDE = {
	/**
	 * Core principles for effective workflow composition
	 */
	core_principles: `
# Core Principles for N8N Workflow Composition

1. **Start with the right trigger**: Every workflow needs a trigger node that initiates execution.
   - For automated workflows: Use Schedule, Webhook, or event-based triggers
   - For manual testing: Use Manual Trigger
   - For sub-workflows: Use Execute Workflow Trigger
   - For chat-based workflows: Use Chat Trigger or Manual Chat Trigger

2. **Follow a logical flow**: Arrange nodes in a clear left-to-right sequence that follows data progression.

3. **Transform data incrementally**: Use Set, Function, or Code nodes between major operations to shape data.

4. **Handle errors gracefully**: Include error handling using Error Trigger nodes or IF nodes with error conditions.

5. **Keep workflows focused**: Each workflow should accomplish a specific task. Break complex processes into multiple workflows.

6. **Use descriptive naming**: Give clear names to nodes and workflows to make them self-documenting.

7. **Test incrementally**: Build and test workflows in small increments rather than creating the entire workflow at once.

8. **Consider workflow activation requirements**: Only workflows with automatic trigger nodes (Schedule, Webhook, etc.) can be activated. Workflows with only manual triggers cannot be automatically activated.
`,

	/**
	 * Node categories and their purposes
	 */
	node_categories: `
# N8N Node Categories and Their Purposes

## Trigger Nodes
Trigger nodes start workflow execution when specific events occur.

- **Manual Trigger**: Starts workflow when manually triggered through the UI
- **Schedule Trigger**: Starts workflow at specified times using cron expressions
- **Webhook Trigger**: Starts workflow when HTTP requests are received
- **Error Trigger**: Starts workflow when errors occur in other workflows
- **Chat Trigger**: Starts workflow when chat messages are received
- **API-specific Triggers**: Start workflows when events occur in specific services (Gmail, Slack, etc.)

## Action Nodes
Action nodes perform operations on data or external systems.

- **HTTP Request**: Makes HTTP requests to APIs
- **Email Send**: Sends emails
- **Database Operations**: Interact with databases (Postgres, MySQL, etc.)
- **File Operations**: Read, write, or manipulate files
- **Service-specific Actions**: Perform actions in specific services (Slack, Google Sheets, etc.)

## Transformation Nodes
Transformation nodes modify, filter, or restructure data.

- **Set**: Sets or updates values in the data
- **Function**: Runs JavaScript code to transform data
- **Code**: Runs more complex JavaScript code with more control
- **JSON/XML**: Parse or create structured data
- **Split/Merge**: Split data into multiple items or merge multiple items
- **Filter**: Filter data based on conditions
- **Switch**: Route data based on conditions

## AI Nodes
AI nodes integrate with AI services and models.

- **OpenAI**: Interact with OpenAI models
- **LangChain Nodes**: Build complex AI applications with LangChain
- **AI Transform**: Transform data using AI
- **Agent**: Create AI agents that can use tools and make decisions
- **Memory**: Store and retrieve conversation history

## Flow Control Nodes
Flow control nodes manage the execution path of workflows.

- **IF**: Conditional branching based on conditions
- **Switch**: Multi-way branching based on values
- **Merge**: Combine data from multiple paths
- **Wait**: Pause workflow execution
- **Loop**: Process items in a loop
`,

	/**
	 * Common workflow patterns
	 */
	common_patterns: `
# Common N8N Workflow Patterns

## Data Fetching and Processing Pattern
- **Structure**: Trigger → Fetch Data → Transform Data → Action
- **Example**: Schedule Trigger → HTTP Request → Set → Database
- **Use Case**: Regularly fetch data from an API, transform it, and store it in a database
- **Key Nodes**: Schedule Trigger, HTTP Request, Set, Database nodes

## Webhook Response Pattern
- **Structure**: Webhook Trigger → Process Data → Respond to Webhook
- **Example**: Webhook Trigger → Function → Respond to Webhook
- **Use Case**: Create an API endpoint that processes incoming requests and returns responses
- **Key Nodes**: Webhook Trigger, Function/Code, Respond to Webhook

## Conditional Execution Pattern
- **Structure**: Trigger → Get Data → IF/Switch → Different Actions Based on Condition
- **Example**: Webhook Trigger → HTTP Request → IF → Send Email / Slack Message
- **Use Case**: Execute different actions based on data conditions
- **Key Nodes**: Any Trigger, IF or Switch, various action nodes

## Batch Processing Pattern
- **Structure**: Trigger → Get Batch Data → Split In Batches → Process Each Batch → Merge Results
- **Example**: Schedule Trigger → Database → Split In Batches → HTTP Request → Merge
- **Use Case**: Process large datasets in smaller chunks
- **Key Nodes**: Any Trigger, Split In Batches, Merge

## Error Handling Pattern
- **Structure**: Main Workflow with Error Trigger → Error Handling Workflow
- **Example**: Main workflow with Error Trigger → Send Error Notification
- **Use Case**: Capture and handle errors from other workflows
- **Key Nodes**: Error Trigger, notification nodes (Email, Slack, etc.)

## Polling Pattern
- **Structure**: Schedule Trigger → Fetch Data → Filter for New Items → Process New Items
- **Example**: Schedule Trigger → HTTP Request → Filter → Function → Database
- **Use Case**: Regularly check for new data and process only what's new
- **Key Nodes**: Schedule Trigger, HTTP Request, Filter, Function

## Data Synchronization Pattern
- **Structure**: Trigger → Fetch Source Data → Fetch Target Data → Compare → Update/Create/Delete
- **Example**: Schedule Trigger → HTTP Request (Source) → Database (Target) → Function (Compare) → Database (Update)
- **Use Case**: Keep data synchronized between different systems
- **Key Nodes**: Any Trigger, multiple data source nodes, Function/Code for comparison
`,

	/**
	 * AI workflow patterns
	 */
	ai_workflow_patterns: `
# AI Workflow Patterns in N8N

## Basic AI Integration Pattern
- **Structure**: Trigger → Prepare Input → AI Model → Process Output → Action
- **Example**: Webhook → Set → OpenAI → Function → Send Email
- **Use Case**: Enhance workflows with AI capabilities like text generation, summarization, or classification
- **Key Nodes**: Any Trigger, OpenAI or other AI nodes, Function/Code for post-processing

## Chained Requests Pattern
- **Structure**: Trigger → AI Model 1 → AI Model 2 → ... → AI Model N → Action
- **Example**: Webhook → OpenAI (Analysis) → OpenAI (Generation) → Send Email
- **Use Case**: Break down complex AI tasks into a series of specialized steps
- **Key Nodes**: Any Trigger, multiple AI model nodes, Function/Code for intermediate processing

## Single Agent Pattern
- **Structure**: Trigger → Input Preparation → AI Agent with Tools → Output Formatting → Action
- **Example**: Chat Trigger → Set → Agent (with HTTP Request Tool) → Set → Respond to Chat
- **Use Case**: Create an AI assistant that can use tools to accomplish tasks
- **Key Nodes**: Chat Trigger, Agent, Tool nodes, Set for formatting

## Mixture of Experts (MOE) Pattern
- **Structure**: Trigger → Input Preparation → Router → Expert Selection → Expert Processing → Merge Results → Output
- **Example**: Chat Trigger → Set → Router LLM → Switch → Specialized LLMs → Merge → Respond to Chat
- **Use Case**: Route queries to specialized AI models based on the query type
- **Key Nodes**: Any Trigger, LLM nodes, Switch, Merge

## Multi-Agent with Gatekeeper Pattern
- **Structure**: Trigger → Gatekeeper Agent → Specialist Agents → Gatekeeper for Final Response → Action
- **Example**: Chat Trigger → Main Agent → Specialized Agents → Main Agent → Respond to Chat
- **Use Case**: Create a system with a main agent that delegates to specialist agents
- **Key Nodes**: Chat Trigger, multiple Agent nodes, Function/Code for coordination

## AI with Memory Pattern
- **Structure**: Trigger → Retrieve Context → Merge with Input → AI Processing → Store New Context → Action
- **Example**: Chat Trigger → Memory Retrieval → Set → LLM → Memory Storage → Respond to Chat
- **Use Case**: Create AI systems that remember previous interactions
- **Key Nodes**: Chat Trigger, Memory nodes, LLM nodes
`,

	/**
	 * Building blocks for different workflow types
	 */
	workflow_building_blocks: `
# Building Blocks for Different N8N Workflow Types

## Data Integration Workflows
- **Essential Nodes**: HTTP Request, Database, Set, Function, Filter
- **Key Patterns**: Polling, Data Synchronization, Batch Processing
- **Best Practices**:
  - Use the Set node to normalize data between systems
  - Implement error handling for API failures
  - Use Filter nodes to process only relevant data
  - Consider rate limits when making API calls

## Notification Workflows
- **Essential Nodes**: Trigger nodes, Filter, Set, Email Send, Slack, Discord, Telegram
- **Key Patterns**: Conditional Execution, Error Handling
- **Best Practices**:
  - Format messages appropriately for each platform
  - Use IF nodes to determine notification urgency
  - Include relevant context in notifications
  - Consider time zones for scheduled notifications

## Document Processing Workflows
- **Essential Nodes**: Read Binary Files, Extract from File, HTTP Request, Set, Function
- **Key Patterns**: Batch Processing, Conditional Execution
- **Best Practices**:
  - Handle different file types appropriately
  - Implement error handling for file processing failures
  - Use Split In Batches for large document sets
  - Consider memory usage for large files

## AI Assistant Workflows
- **Essential Nodes**: Chat Trigger, Agent, Memory, LLM nodes, Tool nodes
- **Key Patterns**: Single Agent, Multi-Agent with Gatekeeper, AI with Memory
- **Best Practices**:
  - Use Memory nodes to maintain conversation context
  - Implement clear system prompts for consistent behavior
  - Use Tool nodes to extend AI capabilities
  - Consider token usage and costs

## Mixture of Experts (MOE) Workflows
- **Essential Nodes**: Chat Trigger, Router LLM, Switch, Expert LLMs, Merge
- **Key Patterns**: MOE Pattern, Conditional Execution
- **Best Practices**:
  - Design the router to accurately classify queries
  - Specialize each expert for its domain
  - Use consistent output formats across experts
  - Consider fallback options for unclassified queries

## Automation Workflows
- **Essential Nodes**: Schedule Trigger, HTTP Request, Function, Database, IF
- **Key Patterns**: Polling, Data Synchronization, Error Handling
- **Best Practices**:
  - Use appropriate scheduling intervals
  - Implement idempotent operations when possible
  - Include comprehensive error handling
  - Log important events for monitoring
`,

	/**
	 * Step-by-step workflow creation process
	 */
	workflow_creation_process: `
# Step-by-Step N8N Workflow Creation Process

## 1. Define the Workflow Purpose
- Clearly identify what the workflow should accomplish
- Determine the trigger events that should start the workflow
- Identify the expected output or actions

## 2. Plan the Workflow Structure
- Choose the appropriate trigger node
- Identify the main processing steps
- Determine the necessary data transformations
- Plan error handling and edge cases

## 3. Create the Trigger Node
- Add the appropriate trigger node (Manual, Schedule, Webhook, etc.)
- Configure the trigger settings (schedule, webhook path, etc.)
- Test the trigger to ensure it activates correctly

## 4. Build the Core Processing Logic
- Add nodes for the main processing steps
- Configure each node with the appropriate settings
- Use Set or Function nodes to prepare data between steps
- Test each step incrementally

## 5. Implement Error Handling
- Add IF nodes to check for error conditions
- Configure error notification mechanisms
- Consider adding Error Trigger nodes for critical workflows

## 6. Test the Complete Workflow
- Test the workflow with various inputs
- Verify that all paths work as expected
- Check error handling by simulating failures

## 7. Refine and Optimize
- Look for opportunities to simplify the workflow
- Optimize for performance and reliability
- Add comments or notes for clarity

## 8. Activate and Monitor
- Activate the workflow if it has automatic triggers
- Set up monitoring to track workflow execution
- Plan for maintenance and updates
`,

	/**
	 * Tips for specific node types
	 */
	node_specific_tips: `
# Tips for Specific N8N Node Types

## Trigger Nodes
- **Manual Trigger**: Use for testing or workflows that should only run on demand
- **Schedule Trigger**: Use cron expressions for precise scheduling
- **Webhook Trigger**: Consider authentication for public-facing webhooks
- **Error Trigger**: Configure to capture specific error types

## HTTP Request Node
- Use authentication when accessing protected APIs
- Handle rate limiting with appropriate retry strategies
- Parse response data with the JSON parameter
- Use expressions for dynamic URLs and parameters

## Function/Code Nodes
- Keep code modular and focused on specific tasks
- Use comments to explain complex logic
- Leverage the built-in n8n libraries and helpers
- Return properly structured data for downstream nodes

## Database Nodes
- Use parameterized queries to prevent SQL injection
- Implement error handling for database operations
- Consider connection pooling for high-volume workflows
- Use transactions for related operations

## AI Nodes
- Provide clear and specific prompts
- Use system messages to guide AI behavior
- Consider token limits and costs
- Implement fallbacks for AI service outages

## Flow Control Nodes
- **IF Node**: Use for simple binary conditions
- **Switch Node**: Use for multiple possible paths
- **Merge Node**: Configure the appropriate merge mode (Append, Merge by Key, etc.)
- **Split In Batches Node**: Adjust batch size based on downstream requirements
`,

	/**
	 * Common workflow examples
	 */
	workflow_examples: `
# Common N8N Workflow Examples

## Data Synchronization Workflow
\`\`\`
Schedule Trigger → HTTP Request (Source API) → Function (Transform) → 
Database (Get Existing) → Function (Compare) → IF → 
Database (Insert/Update) → Error Handling
\`\`\`

## Customer Support Notification Workflow
\`\`\`
Webhook Trigger → Function (Parse Request) → Switch (Priority) → 
Set (Format Message) → Slack/Email/SMS → Respond to Webhook
\`\`\`

## Document Processing Workflow
\`\`\`
Webhook Trigger → Read Binary Files → Extract from File → 
Function (Process Data) → Database (Store Results) → 
Send Email (Notification) → Respond to Webhook
\`\`\`

## AI Content Generation Workflow
\`\`\`
Schedule Trigger → HTTP Request (Get Topics) → Split In Batches → 
OpenAI (Generate Content) → Function (Format) → 
WordPress/CMS (Post Content) → Send Email (Report)
\`\`\`

## Mixture of Experts (MOE) Workflow
\`\`\`
Chat Trigger → Set (Prepare Input) → Router LLM → Switch → 
Expert LLMs (Code/Math/Creative/General) → Merge → 
Set (Format Response) → Respond to Chat
\`\`\`

## Error Monitoring Workflow
\`\`\`
Error Trigger → Function (Parse Error) → Switch (Severity) → 
Set (Format Alert) → Slack/Email/PagerDuty → 
Database (Log Error) → IF (Critical) → HTTP Request (Restart Service)
\`\`\`
`,

	/**
	 * Mixture of Experts (MOE) specific guidance
	 */
	moe_specific_guidance: `
# Mixture of Experts (MOE) Workflow Guidance

## What is a Mixture of Experts (MOE) Workflow?
A Mixture of Experts workflow routes queries or tasks to specialized "expert" components based on the nature of the input. Each expert is optimized for a specific type of task, allowing the system to provide high-quality responses across a diverse range of queries.

## Key Components of MOE Workflows

### 1. Input Handler
- Receives and preprocesses the initial query
- Typically a Chat Trigger or Webhook Trigger node
- May include Set nodes for input formatting

### 2. Router
- Analyzes the input to determine which expert should handle it
- Usually an LLM node with a specialized prompt
- Should output a clear classification or routing decision

### 3. Switching Mechanism
- Directs the query to the appropriate expert based on the router's decision
- Typically a Switch node
- Should handle all possible routing outcomes

### 4. Expert Components
- Specialized nodes or sub-workflows optimized for specific types of queries
- Each expert should have a clear domain of expertise
- Experts can be LLMs with different prompts, parameters, or even different models

### 5. Result Aggregator
- Combines the outputs from the experts
- Typically a Merge node
- Ensures consistent output format regardless of which expert was used

### 6. Response Formatter
- Prepares the final response for delivery
- Usually a Set node
- Ensures consistent presentation of results

## MOE Implementation Approaches

### 1. Prompt-Based Experts
- Use the same LLM with different prompts for each expert
- Simpler to implement but may have limitations in specialization
- Example: OpenAI node with different system messages for each expert

### 2. Model-Based Experts
- Use different AI models for different types of queries
- More powerful but potentially more complex and costly
- Example: GPT-4 for reasoning, Claude for creative, Mistral for code

### 3. Tool-Based Experts
- Combine AI models with specialized tools for different domains
- Most flexible but requires more complex workflow design
- Example: Code expert with GitHub integration, Math expert with calculator tools

## Best Practices for MOE Workflows

1. **Design an effective router**: The router should accurately classify queries to ensure they reach the appropriate expert.

2. **Balance expert specialization**: Each expert should have a clear domain without too much overlap.

3. **Maintain consistent output formats**: Ensure all experts return results in a compatible format.

4. **Implement a fallback expert**: Include a general-purpose expert for queries that don't clearly match any specialty.

5. **Consider performance and cost**: Different experts may have different resource requirements and costs.

6. **Test with diverse inputs**: Verify that the router correctly classifies a wide range of queries.

7. **Monitor and refine**: Track which experts are used most frequently and refine the system accordingly.
`,

	/**
	 * Error handling best practices
	 */
	error_handling: `
# Error Handling Best Practices in N8N Workflows

## Common Error Types
- API connection failures
- Data validation errors
- Authentication issues
- Rate limiting
- Timeout errors
- Resource constraints

## Workflow-Level Error Handling
- Use Error Trigger nodes to create dedicated error handling workflows
- Configure workflow settings for error behavior
- Implement global error notification systems

## Node-Level Error Handling
- Use IF nodes to check for error conditions
- Implement retry logic for transient errors
- Use Try/Catch patterns with Function nodes

## Data Validation
- Validate input data early in the workflow
- Use Function nodes to check data integrity
- Implement type checking and format validation

## Error Notification Strategies
- Send alerts for critical errors
- Log all errors for analysis
- Include context information in error messages
- Consider severity levels for different types of errors

## Recovery Strategies
- Implement automatic retries with exponential backoff
- Create self-healing workflows where possible
- Design graceful degradation for partial failures

## Testing for Errors
- Simulate error conditions during testing
- Verify that error handling works as expected
- Test recovery mechanisms
`,

	/**
	 * Performance optimization
	 */
	performance_optimization: `
# Performance Optimization for N8N Workflows

## Workflow Design Optimization
- Keep workflows focused and modular
- Break large workflows into smaller, connected workflows
- Use Execute Workflow nodes for reusable components
- Minimize unnecessary data processing

## Data Handling Optimization
- Filter data early to reduce processing volume
- Use pagination for large datasets
- Implement batching for bulk operations
- Minimize data transformations

## Node-Specific Optimization
- Use Set nodes instead of Function nodes for simple transformations
- Optimize database queries to retrieve only necessary data
- Use appropriate indexing for database operations
- Configure HTTP Request nodes with proper caching

## Resource Management
- Schedule resource-intensive workflows during off-peak hours
- Implement rate limiting for API calls
- Monitor memory usage for large data processing
- Consider horizontal scaling for high-volume workflows

## Caching Strategies
- Implement caching for frequently accessed data
- Use If nodes to skip unnecessary processing
- Store intermediate results for long-running workflows
- Consider external caching solutions for shared data
`,

	/**
	 * Workflow testing and debugging
	 */
	testing_and_debugging: `
# Workflow Testing and Debugging in N8N

## Testing Approaches
- Test workflows incrementally during development
- Use Manual Trigger nodes for isolated testing
- Create test datasets for consistent testing
- Implement end-to-end testing for critical workflows

## Debugging Techniques
- Use the n8n execution history to review workflow runs
- Add debug nodes to inspect data at various points
- Use console.log() in Function nodes for detailed logging
- Implement conditional breakpoints with IF nodes

## Common Issues and Solutions
- Data type mismatches: Use Set nodes to ensure correct types
- Missing fields: Implement default values or error checking
- API rate limiting: Add delays or implement backoff strategies
- Authentication failures: Verify credential configuration

## Testing Tools
- Use the n8n built-in testing features
- Implement monitoring for production workflows
- Create dedicated testing workflows
- Use version control for workflow configurations
`,

	/**
	 * Security considerations
	 */
	security_considerations: `
# Security Considerations for N8N Workflows

## Authentication and Authorization
- Use secure authentication methods for API connections
- Implement proper authorization checks in webhook endpoints
- Rotate API keys and credentials regularly
- Use the n8n credentials manager for sensitive information

## Data Security
- Minimize storage of sensitive data
- Implement data masking for logs and outputs
- Consider encryption for sensitive stored data
- Implement proper data retention policies

## Access Control
- Restrict access to workflow editing
- Implement role-based access control
- Audit workflow changes regularly
- Use separate environments for development and production

## Network Security
- Secure webhook endpoints with authentication
- Implement rate limiting for public endpoints
- Use HTTPS for all external communications
- Consider IP restrictions for sensitive endpoints

## Error Handling Security
- Avoid exposing sensitive information in error messages
- Implement proper logging for security events
- Create alerts for suspicious activities
- Regularly review error logs for security issues
`,
};
