// webhook.js
const express = require('express');
const router = express.Router();
const { bookFlight, cancelFlight, searchFlights } = require('./flights');

router.post('/webhook', async (req, res) => {
    const action = req.body.queryResult.action;
    switch(action) {
        case 'bookFlight':
            const { from, to, departureDate } = req.body.queryResult.parameters;
            try {
                const result = await bookFlight(from, to, departureDate);
                res.json({ fulfillmentText: `Flight from ${from} to ${to} on ${departureDate} booked successfully. Details: ${JSON.stringify(result)}` });
            } catch (error) {
                res.status(500).json({ fulfillmentText: `Failed to book flight: ${error.message}` });
            }
            break;
        case 'cancelFlight':
            const { flightNumber } = req.body.queryResult.parameters;
            try {
                const result = await cancelFlight(flightNumber);
                res.json({ fulfillmentText: `Flight number ${flightNumber} cancelled successfully.` });
            } catch (error) {
                res.status(500).json({ fulfillmentText: `Failed to cancel flight: ${error.message}` });
            }
            break;
        case 'queryFlightStatus':
            const { flightNumber: queryFlightNumber } = req.body.queryResult.parameters;
            try {
                const flights = await searchFlights({ flightNumber: queryFlightNumber });
                if (flights.length > 0) {
                    const flightDetails = flights.map(flight => `${flight.airline} flight ${flight.flightNumber} from ${flight.departureAirport} to ${flight.arrivalAirport} departs at ${flight.departureTime} and arrives at ${flight.arrivalTime}`).join(", ");
                    res.json({ fulfillmentText: `Here are the details of your flight(s): ${flightDetails}` });
                } else {
                    res.json({ fulfillmentText: "No flights found with that flight number." });
                }
            } catch (error) {
                res.status(500).json({ fulfillmentText: `Failed to retrieve flight status: ${error.message}` });
            }
            break;
        default:
            res.status(404).send('Intent not found');
    }
});

module.exports = router;
