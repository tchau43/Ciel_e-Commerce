// BE/setupAssistant.js
require('dotenv').config();
const { setupAssistant } = require('./src/config/createAssistant');

console.log('Starting assistant setup...');

setupAssistant()
    .then(assistant => {
        console.log('Assistant setup completed successfully!');
        console.log(`Assistant ID: ${assistant.id}`);
        console.log(`Assistant Name: ${assistant.name}`);
        console.log(`Assistant Model: ${assistant.model}`);
        console.log(`Number of tools: ${assistant.tools.length}`);
        process.exit(0);
    })
    .catch(error => {
        console.error('Error setting up assistant:', error);
        process.exit(1);
    }); 