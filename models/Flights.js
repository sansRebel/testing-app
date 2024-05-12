// models/Flight.js
const mongoose = require('mongoose');



const flightSchema = new mongoose.Schema({
  flightNumber: String,
  from: String,
  to: String,
  departureTime: Date,
  arrivalTime: Date,
  airline: String
});

const Flight = mongoose.model('Flight', flightSchema);
module.exports = Flight;
