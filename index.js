require('dotenv').config();
const fs = require('fs');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const dialogflow = require('dialogflow');
const app = express();

// Correct placement of body-parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const credentialsPath = '';
// Read Google credentials from a file
const googleCredentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));

const sessionClient = new dialogflow.SessionsClient({
  credentials: googleCredentials
});

app.use(cors());
app.use(express.json());  // This is redundant because bodyParser.json() is already used

const flightRoutes = require('./routes/flights'); 
app.use('/api/flights', flightRoutes);

const PORT = process.env.PORT || 3001;

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

app.get('/', (req, res) => res.send('Hello World!'));

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

app.get('/api/chat/messages', (req, res) => {
    res.json([{ _id: 1, body: "Welcome to our service! How can I assist you today?" }]);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
