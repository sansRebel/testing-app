const express = require('express');
const router = express.Router();
const { bookFlight, cancelFlight, searchFlights } = require('./flights');

router.post('/', async (req, res) => {
    console.log("Webhook route hit", req.body);
    const action = req.body.queryResult.action;
    switch(action) {
        case 'bookFlight':
            const { from, to, date: departureDate } = req.body.queryResult.parameters;
            const bookingResult = await bookFlight(from, to, departureDate);
            if (bookingResult.status === 'success') {
                res.json({ fulfillmentText: bookingResult.message });
            } else {
                res.status(500).json({ fulfillmentText: bookingResult.message });
            }
            break;
        case 'cancelFlight':
            const { flightNumber } = req.body.queryResult.parameters;
            const cancellationResult = await cancelFlight(flightNumber);
            if (cancellationResult.status === 'success') {
                res.json({ fulfillmentText: cancellationResult.message });
            } else if (cancellationResult.status === 'not found') {
                res.status(404).json({ fulfillmentText: cancellationResult.message });
            } else {
                res.status(500).json({ fulfillmentText: cancellationResult.message });
            }
            break;
        case 'queryFlightStatus':
            const flightsResult = await searchFlights(req.body.queryResult.parameters);
            if (flightsResult.status === 'success' && flightsResult.flights.length > 0) {
                const flightDetails = flightsResult.flights.map(flight => `${flight.airline} flight ${flight.flightNumber} from ${flight.departureAirport} to ${flight.arrivalAirport} departs at ${flight.departureTime} and arrives at ${flight.arrivalTime}`).join(", ");
                res.json({ fulfillmentText: `Here are the details of your flight(s): ${flightDetails}` });
            } else if (flightsResult.flights.length === 0) {
                res.json({ fulfillmentText: "No flights found with that flight number." });
            } else {
                res.status(500).json({ fulfillmentText: `Failed to retrieve flight status: ${flightsResult.message}` });
            }
            break;
        default:
            res.status(404).send('Action not found');
    }
});

module.exports = router;
