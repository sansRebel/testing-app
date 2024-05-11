// models/Flight.js
const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema({
  flightNumber: String,
  departureAirport: String,
  arrivalAirport: String,
  departureTime: Date,
  arrivalTime: Date,
  airline: String
});

const Flight = mongoose.model('Flight', flightSchema);
module.exports = Flight;
