const express = require('express');
const router = express.Router();
const Flight = require('../models/Flights'); 

// Helper function to generate random flight number
function generateFlightNumber() {
    return "MH" + Math.floor(100 + Math.random() * 900);
}



// Airlines sample data
const airlines = ["Air Malaysia", "Malaysia Sky", "Kuala Airways", "Penang Flight Co"];

// Function to book a flight
async function bookFlight(from, to, departureDateArray) {
    const departureDateString = departureDateArray[0];  // Assuming the date comes in as an array
    const departureDate = new Date(departureDateString);

    if (isNaN(departureDate.valueOf())) {
        console.error("Invalid departure date:", departureDateString);
        return { status: 'error', message: 'Invalid departure date format' };
    }

    const arrivalDate = new Date(departureDate);
    arrivalDate.setHours(arrivalDate.getHours() + 1, arrivalDate.getMinutes() + 15);

    const newFlight = new Flight({
        flightNumber: generateFlightNumber(),
        from: from[0],
        to: to[0],
        departureTime: departureDate,
        arrivalTime: arrivalDate,
        airline: airlines[Math.floor(Math.random() * airlines.length)]
    });

    console.log("Attempting to save flight:", newFlight);  // Log the flight object before saving

    try {
        const savedFlight = await newFlight.save();
        console.log("Flight saved successfully:", savedFlight);  // Log the saved flight
        return {
            status: 'success',
            message: `Flight booked successfully! Flight Number: ${savedFlight.flightNumber}, From: ${savedFlight.from}, To: ${savedFlight.to}`
        };
        
    } catch (error) {
        console.error('Error booking flight:', error);
        return { status: 'error', message: 'Error booking flight', details: error.message };
    }
}


// Function to cancel a flight
async function cancelFlight(flightNumberArray) {
    const flightNumber = flightNumberArray[0]; // Assuming the first element is the flight number
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
