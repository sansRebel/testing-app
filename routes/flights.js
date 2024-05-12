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
async function bookFlight(from, to, departureDateArray) {
    try {
        const departureDateString = departureDateArray[0]; // Assuming the date comes in as an array, we take the first element
        console.log("Received date string:", departureDateString);  // Log the corrected date string
        const departureDate = new Date(departureDateString);

        if (isNaN(departureDate.valueOf())) {
            console.error("Invalid departure date:", departureDateString);
            return { status: 'error', message: 'Invalid departure date format' };
        }

        const arrivalDate = new Date(departureDate);
        arrivalDate.setHours(arrivalDate.getHours() + 1, arrivalDate.getMinutes() + 15); // Adjust arrival time calculation

        const newFlight = new Flight({
            flightNumber: generateFlightNumber(),
            from: from[0], // Similarly, ensure 'from' and 'to' are processed if they are arrays
            to: to[0],
            departureTime: departureDate,
            arrivalTime: arrivalDate,
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
async function searchFlights(query) {
    try {
        const flights = await Flight.find(query);
        return { status: 'success', flights };
    } catch (error) {
        console.error('Error fetching flights:', error);
        return { status: 'error', message: 'Error fetching flights', details: error.message };
    }
}

module.exports = {
    router,
    bookFlight,
    cancelFlight,
    searchFlights
};
