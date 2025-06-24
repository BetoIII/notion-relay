export default {
	async fetch(request, env) {
		try {
			if (request.method !== 'POST') {
				return new Response('Method Not Allowed', { status: 405 });
			}

			// Check if required environment variables exist
			if (!env.NOTION_TOKEN) {
				return new Response('Missing NOTION_TOKEN environment variable', { status: 400 });
			}
			if (!env.NOTION_DB_ID) {
				return new Response('Missing NOTION_DB_ID environment variable', { status: 400 });
			}

			// Add better error handling for JSON parsing
			let payload;
			try {
				payload = await request.json();
			} catch (error) {
				return new Response(`Invalid JSON in request body: ${error.message}`, { status: 400 });
			}

			console.log('Received payload:', JSON.stringify(payload));
			console.log('Using Notion DB ID:', env.NOTION_DB_ID);

			// Normalize the database ID format (add hyphens if missing)
			let dbId = env.NOTION_DB_ID.replace(/[^a-f0-9]/gi, '');
			if (dbId.length === 32) {
				dbId = `${dbId.substring(0, 8)}-${dbId.substring(8, 12)}-${dbId.substring(12, 16)}-${dbId.substring(16, 20)}-${dbId.substring(20)}`;
			} else {
				dbId = env.NOTION_DB_ID; // Use as-is if already formatted
			}
			console.log('Normalized DB ID:', dbId);

			// First, retrieve the database schema to understand available properties
			const dbSchemaRes = await fetch(`https://api.notion.com/v1/databases/${dbId}`, {
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${env.NOTION_TOKEN}`,
					'Notion-Version': '2022-06-28'
				}
			});

			if (!dbSchemaRes.ok) {
				const dbError = await dbSchemaRes.text();
				console.log('Database schema fetch error:', dbError);
				return new Response(`Database access error (${dbSchemaRes.status}): ${dbError}`, { 
					status: dbSchemaRes.status 
				});
			}

			const dbSchema = await dbSchemaRes.json();
			console.log('Database schema properties:', Object.keys(dbSchema.properties));

			// Find the title property (there should be exactly one)
			const titleProperty = Object.entries(dbSchema.properties).find(([key, prop]) => prop.type === 'title');
			if (!titleProperty) {
				return new Response('No title property found in database schema', { status: 400 });
			}

			const [titlePropertyName] = titleProperty;
			console.log('Found title property:', titlePropertyName);

			// Check if we need to add new properties to the database
			const existingProperties = Object.keys(dbSchema.properties);
			const incomingProperties = Object.keys(payload);
			const missingProperties = incomingProperties.filter(prop => 
				!existingProperties.includes(prop) && 
				prop !== 'callerName' // Skip callerName as it goes in title
			);

			// Add missing properties to database schema if any
			if (missingProperties.length > 0) {
				console.log('Adding missing properties to database:', missingProperties);
				
				const updateProperties = {};
				missingProperties.forEach(propName => {
					const value = payload[propName];
					// Determine property type based on value type
					if (typeof value === 'number') {
						updateProperties[propName] = { number: {} };
					} else if (typeof value === 'boolean') {
						updateProperties[propName] = { checkbox: {} };
					} else if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/)) {
						updateProperties[propName] = { date: {} };
					} else {
						updateProperties[propName] = { rich_text: {} };
					}
				});

				const updateRes = await fetch(`https://api.notion.com/v1/databases/${dbId}`, {
					method: 'PATCH',
					headers: {
						'Authorization': `Bearer ${env.NOTION_TOKEN}`,
						'Content-Type': 'application/json',
						'Notion-Version': '2022-06-28'
					},
					body: JSON.stringify({
						properties: updateProperties
					})
				});

				if (!updateRes.ok) {
					const updateError = await updateRes.text();
					console.log('Database update error:', updateError);
					// Continue anyway - we'll try to create the page with existing properties
				} else {
					console.log('Successfully added new properties to database');
				}

				// Refresh database schema after update
				const refreshedDbRes = await fetch(`https://api.notion.com/v1/databases/${dbId}`, {
					method: 'GET',
					headers: {
						'Authorization': `Bearer ${env.NOTION_TOKEN}`,
						'Notion-Version': '2022-06-28'
					}
				});

				if (refreshedDbRes.ok) {
					const refreshedSchema = await refreshedDbRes.json();
					Object.assign(dbSchema.properties, refreshedSchema.properties);
				}
			}

			// Create a Notion payload that maps JSON fields to database properties
			const notionPayload = {
				parent: { database_id: dbId },
				properties: {}
			};

			// Set the title property
			notionPayload.properties[titlePropertyName] = { 
				title: [{ 
					text: { 
						content: payload.callerName || `Request from ${new Date().toISOString()}` 
					} 
				}] 
			};

			// Map each payload field to appropriate database property
			Object.entries(payload).forEach(([key, value]) => {
				if (key === 'callerName') return; // Already handled in title
				
				const dbProperty = dbSchema.properties[key];
				if (!dbProperty) return; // Skip if property doesn't exist in schema

				try {
					switch (dbProperty.type) {
						case 'rich_text':
							notionPayload.properties[key] = {
								rich_text: [{
									type: 'text',
									text: { content: String(value).substring(0, 2000) }
								}]
							};
							break;
						case 'number':
							if (!isNaN(value)) {
								notionPayload.properties[key] = {
									number: Number(value)
								};
							}
							break;
						case 'checkbox':
							notionPayload.properties[key] = {
								checkbox: Boolean(value)
							};
							break;
						case 'date':
							if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/)) {
								notionPayload.properties[key] = {
									date: { start: value }
								};
							}
							break;
						case 'select':
						case 'multi_select':
							// For select properties, we'd need to handle options
							// For now, convert to rich_text to avoid errors
							notionPayload.properties[key] = {
								rich_text: [{
									type: 'text',
									text: { content: String(value).substring(0, 2000) }
								}]
							};
							break;
						default:
							// Default to rich_text for unknown types
							notionPayload.properties[key] = {
								rich_text: [{
									type: 'text',
									text: { content: String(value).substring(0, 2000) }
								}]
							};
					}
				} catch (error) {
					console.log(`Error mapping property ${key}:`, error);
					// Fallback to rich_text
					notionPayload.properties[key] = {
						rich_text: [{
							type: 'text',
							text: { content: String(value).substring(0, 2000) }
						}]
					};
				}
			});

			console.log('Sending to Notion:', JSON.stringify(notionPayload));

			const notionRes = await fetch('https://api.notion.com/v1/pages', {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${env.NOTION_TOKEN}`,
					'Content-Type': 'application/json',
					'Notion-Version': '2022-06-28'
				},
				body: JSON.stringify(notionPayload)
			});

			const notionResponseText = await notionRes.text();
			console.log('Notion response status:', notionRes.status);
			console.log('Notion response body:', notionResponseText);

			if (!notionRes.ok) {
				return new Response(`Notion API error (${notionRes.status}): ${notionResponseText}`, { 
					status: notionRes.status 
				});
			}

			return new Response(`Success! Notion status ${notionRes.status}`, { status: 200 });

		} catch (error) {
			console.error('Worker error:', error);
			return new Response(`Worker error: ${error.message}`, { status: 500 });
		}
	}
}

// Alternative Approach 2: Create New Database for Each Data Structure
// This would replace the main logic in the fetch handler

async function createNewDatabaseApproach(payload, env) {
	// Generate a database name based on the data structure or event type
	const databaseName = payload.eventType || payload.callerName || `Data_${new Date().toISOString().split('T')[0]}`;
	
	// Analyze the payload to determine database schema
	const properties = {
		"Name": { title: {} } // Required title property
	};
	
	Object.entries(payload).forEach(([key, value]) => {
		if (key === 'callerName') return; // This will go in the title
		
		// Determine property type based on value
		if (typeof value === 'number') {
			properties[key] = { number: {} };
		} else if (typeof value === 'boolean') {
			properties[key] = { checkbox: {} };
		} else if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/)) {
			properties[key] = { date: {} };
		} else if (typeof value === 'string' && value.length < 50) {
			// Short strings become select properties with the value as an option
			properties[key] = {
				select: {
					options: [
						{
							name: value,
							color: "default"
						}
					]
				}
			};
		} else {
			properties[key] = { rich_text: {} };
		}
	});

	// Create new database
	const createDbPayload = {
		parent: {
			type: "page_id",
			page_id: "YOUR_PARENT_PAGE_ID" // You'd need to configure this
		},
		title: [
			{
				type: "text",
				text: {
					content: databaseName
				}
			}
		],
		properties: properties
	};

	// Create the database
	const dbResponse = await fetch('https://api.notion.com/v1/databases', {
		method: 'POST',
		headers: {
			'Authorization': `Bearer ${env.NOTION_TOKEN}`,
			'Content-Type': 'application/json',
			'Notion-Version': '2022-06-28'
		},
		body: JSON.stringify(createDbPayload)
	});

	if (!dbResponse.ok) {
		throw new Error(`Failed to create database: ${await dbResponse.text()}`);
	}

	const newDatabase = await dbResponse.json();
	console.log('Created new database:', newDatabase.id);

	// Now create a page in the new database
	const pagePayload = {
		parent: { database_id: newDatabase.id },
		properties: {
			"Name": {
				title: [{
					text: { content: payload.callerName || `Entry ${new Date().toISOString()}` }
				}]
			}
		}
	};

	// Add other properties
	Object.entries(payload).forEach(([key, value]) => {
		if (key === 'callerName') return;
		
		const property = properties[key];
		if (property.type === 'number') {
			pagePayload.properties[key] = { number: Number(value) };
		} else if (property.type === 'checkbox') {
			pagePayload.properties[key] = { checkbox: Boolean(value) };
		} else if (property.type === 'date') {
			pagePayload.properties[key] = { date: { start: value } };
		} else if (property.type === 'select') {
			pagePayload.properties[key] = { select: { name: value } };
		} else {
			pagePayload.properties[key] = {
				rich_text: [{ text: { content: String(value) } }]
			};
		}
	});

	// Create the page
	const pageResponse = await fetch('https://api.notion.com/v1/pages', {
		method: 'POST',
		headers: {
			'Authorization': `Bearer ${env.NOTION_TOKEN}`,
			'Content-Type': 'application/json',
			'Notion-Version': '2022-06-28'
		},
		body: JSON.stringify(pagePayload)
	});

	return pageResponse;
}
  