// models/Flight.js
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

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
