// routes/flights.js

const express = require('express');
const router = express.Router();
const Flight = require('../models/Flights'); // Adjust the path as necessary

// Route to get flights by departure and arrival state
router.get('/search', async (req, res) => {
    const { from, to, departureDate, flightNumber } = req.query;
    let query = {};
    
    if (from) query.from = from;
    if (to) query.to = to;
    if (departureDate) query.departureTime = { $gte: new Date(departureDate + "T00:00:00Z"), $lt: new Date(departureDate + "T23:59:59Z") };
    if (flightNumber) query.flightNumber = flightNumber;

    try {
        const flights = await Flight.find(query);
        console.log(query);
        console.log(flights);
        res.json(flights);
    } catch (error) {
        console.error('Error fetching flights:', error);
        res.status(500).send('Error fetching flights');
    }

});

// Helper function to generate random flight number
function generateFlightNumber() {
    return "MH" + Math.floor(100 + Math.random() * 900);
}

// Helper function to calculate arrival time based on departure
function calculateArrivalTime(departureTime) {
    const departure = new Date(departureTime);
    return new Date(departure.setHours(departure.getHours() + 1, departure.getMinutes() + 15)); // Adds 1 hour and 15 minutes
}

// Airlines sample data
const airlines = ["Air Malaysia", "Malaysia Sky", "Kuala Airways", "Penang Flight Co"];

// Endpoint to create a booking
router.post('/book', async (req, res) => {
    const { from, to, departureDate } = req.body;

    try {
        const newFlight = new Flight({
            flightNumber: generateFlightNumber(),
            from,
            to,
            departureTime: new Date(departureDate + "T09:00:00Z"), // Assume fixed departure time for simplicity
            arrivalTime: calculateArrivalTime(departureDate + "T09:00:00Z"),
            airline: airlines[Math.floor(Math.random() * airlines.length)]
        });

        await newFlight.save();
        res.status(201).json({ message: "Flight booked successfully", flightDetails: newFlight });
    } catch (error) {
        console.error('Error creating flight booking:', error);
        res.status(500).send('Error booking flight');
    }
});

// Route to cancel a flight booking by flight number
router.delete('/cancel', async (req, res) => {
    const { flightNumber } = req.query;

    try {
        // Find bookings by flight number and delete them
        const result = await Flight.deleteMany({
            'flight': await Flight.findOne({ flightNumber: flightNumber }).select('_id')
        });

        if (result.deletedCount === 0) {
            res.status(404).json({ message: 'No bookings found with that flight number.' });
        } else {
            res.json({ message: 'Bookings cancelled successfully' });
        }
    } catch (error) {
        console.error('Error cancelling bookings:', error);
        res.status(500).json({ error: 'Error cancelling bookings' });
    }
});


module.exports = router;
