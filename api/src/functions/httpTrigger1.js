const { app } = require('@azure/functions');

app.http('httpTrigger1', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

        const name = request.query.get('name') || await request.text() || 'world';

        return { 
            status: 200, // Ensure to specify status code
            headers: { "Content-Type": "application/json" }, // Specify the content type
            body: JSON.stringify({ text: `Hello, ${name}!` })  // Return JSON object
        };
    }
});
