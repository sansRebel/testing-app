const express = require('express');
const router = express.Router();
const Flight = require('../models/Flights'); // Adjust the path as necessary

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

// Function to book a flight
async function bookFlight(from, to, departureDate) {
    try {
        const newFlight = new Flight({
            flightNumber: generateFlightNumber(),
            from,
            to,
            departureTime: new Date(departureDate + "T09:00:00Z"),
            arrivalTime: calculateArrivalTime(departureDate + "T09:00:00Z"),
            airline: airlines[Math.floor(Math.random() * airlines.length)]
        });

        await newFlight.save();
        return { status: 'success', message: "Flight booked successfully", flightDetails: newFlight };
    } catch (error) {
        console.error('Error booking flight:', error);
        return { status: 'error', message: 'Error booking flight', details: error.message };
    }
}

// Function to cancel a flight
async function cancelFlight(flightNumber) {
    try {
        const result = await Flight.deleteMany({ flightNumber: flightNumber });
        if (result.deletedCount === 0) {
            return { status: 'not found', message: 'No bookings found with that flight number.' };
        } else {
            return { status: 'success', message: 'Bookings cancelled successfully' };
        }
    } catch (error) {
        console.error('Error cancelling bookings:', error);
        return { status: 'error', message: 'Error cancelling bookings', details: error.message };
    }
}

// Function to search flights
async function searchFlights(from, to, departureDate, flightNumber) {
    let query = {};
    if (from) query.from = from;
    if (to) query.to = to;
    if (departureDate) query.departureTime = { $gte: new Date(departureDate + "T00:00:00Z"), $lt: new Date(departureDate + "T23:59:59Z") };
    if (flightNumber) query.flightNumber = flightNumber;

    try {
        const flights = await Flight.find(query);
        return { status: 'success', flights };
    } catch (error) {
        console.error('Error fetching flights:', error);
        return { status: 'error', message: 'Error fetching flights', details: error.message };
    }
}

// Export functions to be used in webhook.js
module.exports = router;
module.exports = { bookFlight, cancelFlight, searchFlights };
