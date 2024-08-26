const express = require('express');
const eventRouter = express.Router();
const eventModel = require('../models/eventModel');  // Make sure this path is correct

eventRouter.post('/createEvent', async (req, res) => {
    try {
        // Destructure the required fields from the request body
        const { 
            name, 
            description, 
            location, 
            date, 
            time, 
            organization, 
            hostedBy, 
            nfcUUID, 
            approvalNeeded, 
             
        } = req.body;

        // Check if the event with the same name, location, date, and time already exists
        const existingEvent = await eventModel.findOne({ name, location, date, time });
        if (existingEvent) {
            return res.status(400).json({ message: 'Event already exists' });
        }

        // Create the new event
        const newEvent = await eventModel.create({
            name, 
            description, 
            location, 
            date, 
            time, 
            organization, 
            hostedBy, 
             // Empty array or with initial attendees
            nfcUUID, 
            approvalNeeded, 
            
        });

        // Get the newly created event's ID
        const eventId = newEvent._id;

        // Return a success response
        return res.status(201).json({ message: 'Event created successfully', eventId });
    } catch (err) {
        // Handle errors and return a server error response
        res.status(500).json({ message: err.message });
    }
});

module.exports = eventRouter;
