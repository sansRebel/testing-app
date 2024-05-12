require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const dialogflow = require('dialogflow');
const app = express();

// Decode Google credentials from environment variable
const googleCredentials = JSON.parse(Buffer.from(process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64, 'base64').toString('utf8'));
const sessionClient = new dialogflow.SessionsClient({
    credentials: googleCredentials
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors({
    origin: 'https://testing-app-client.vercel.app',  // Adjust as necessary
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB connected');

        // Routes setup
        const { router: flightRoutes } = require('./routes/flights');
        const webhookRoutes = require('./routes/webhook');
        app.use('/api/flights', flightRoutes);
        app.use('/webhook', webhookRoutes);

        // Default route
        app.get('/', (req, res) => res.send('Hello World!'));

        // API route for chat messages
        app.post('/api/chat/message', async (req, res) => {
            const { message } = req.body;
            const sessionPath = sessionClient.sessionPath('sans-wraq', 'unique-session-id');
            const request = {
                session: sessionPath,
                queryInput: {
                    text: {
                        text: message,
                        languageCode: 'en-US',
                    },
                },
            };
            try {
                const responses = await sessionClient.detectIntent(request);
                const fulfillmentText = responses[0].queryResult.fulfillmentText;
                res.json({ _id: new Date().getTime(), body: fulfillmentText });
            } catch (error) {
                console.error('Dialogflow request error:', error);
                res.status(500).json({ error: 'Error processing your message', details: error.message });
            }
        });

        // API route for fetching chat messages (static example)
        app.get('/api/chat/messages', (req, res) => {
            res.json([{ _id: 1, body: "Welcome to our service! How can I assist you today?" }]);
        });

        // Server listening
        const PORT = process.env.PORT || 3001;
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });
