const { app } = require('@azure/functions');

app.http('httpTrigger2', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

        const name = 'from API';

        return { body: `Hello, ${name}!` };
    }
});
