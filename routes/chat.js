const express = require('express');
const router = express.Router();
const Message = require('../models/Messages');
const dialogflow = require('dialogflow');

// Dialogflow session client setup
const sessionClient = new dialogflow.SessionsClient();
const sessionPath = sessionClient.sessionPath('sans-wraq', 'session-id');

router.post('/message', async (req, res) => {
    const userMessage = req.body.message;

    // Prepare request for Dialogflow
    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                text: userMessage,
                languageCode: 'en-US',
            },
        },
    };

    try {
        const dialogflowResponse = await sessionClient.detectIntent(request);
        const dialogflowResult = dialogflowResponse[0].queryResult;

        // Create a message with the Dialogflow response
        const message = new Message({
            body: dialogflowResult.fulfillmentText,  
            conversationId: req.body.userId
        });

        await message.save();
        res.status(201).json(message);
    } catch (error) {
        console.error('Dialogflow API error:', error);
        res.status(500).json({ error: 'Error processing your message' });
    }
});


router.get('/messages/:userId', async (req, res) => {
    try {
        const messages = await Message.find({ conversationId: req.params.userId });
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
