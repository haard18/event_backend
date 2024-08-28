const express = require('express');
const eventRouter = express.Router();
const eventModel = require('../models/eventModel');
const userModel = require('../models/userModel');
const jwt = require('jsonwebtoken');
require('dotenv').config();
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
            nfcUUID,
            approvalNeeded,
            poapURL,
            attendees = []  // Optional, defaults to an empty array
        } = req.body;
        const token = req.header('auth-token');
        if (!token) return res.status(401).json({ message: 'Unauthorized' });
        const userId = jwt.verify(token, process.env.JWT_SECRET);
        console.log(userId);
        // Check if an event with the same name, location, date, and time already exists
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
            hostedBy: userId?.id,
            attendees, 
            nfcUUID,
            approvalNeeded,
            poapURL
        });

       
        const eventId = newEvent._id;

        
        return res.status(201).json({ message: 'Event created successfully', eventId });
    } catch (err) {
   
        res.status(500).json({ message: err.message });
    }
});

eventRouter.post('/attendEvent/:eventId', async (req, res) => {
    try {
        const token = req.header('auth-token');
        const eventId = req.params.eventId;
        if (!token) return res.status(401).json({ message: 'Unauthorized' });
        const userId = jwt.verify(token, process.env.JWT_SECRET);
        const user=await userModel.findById(userId.id);

        if (!user) return res.status(404).json({ message: "User not found" });
        user.events_attended.push(eventId);
        await user.save();
        const event = await eventModel.findById(eventId);
        if (!event) return res.status(404).json({ message: "Event not found" });
        //check if the user is already attending the event
        const isAttending = event.attendees.find(attendee => attendee.user.toString() === userId.id);
        if (isAttending) return res.status(400).json({ message: "User is already attending the event" });
        const attendee = {
            user: userId.id,
            approvalStatus: event.approvalNeeded ? 'pending' : 'approved'
        }
        event.attendees.push(attendee);
        await event.save();

        return res.status(200).json({ message: "Event attended successfully" });

    } catch (error) {

    }
})
eventRouter.get('/getAllAttendees/:eventId', async (req, res) => {
    try {
        const { eventId } = req.params;

        
        const event = await eventModel.findById(eventId).populate('attendees.user', '-password -__v');  // Exclude password and version key


        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        
        return res.status(200).json({ attendees: event.attendees });
    } catch (error) {
      
        return res.status(500).json({ message: error.message });
    }
});
eventRouter.get('/getApprovedAttendees/:eventId', async (req, res) => {
    try {

        const { eventId } = req.params;
        const event=await eventModel.findById(eventId).populate('attendees.user','-password -__v -events_attended -events_hosted');
        if(!event)return res.status(404).json({message:"Event not found"});
        const approvedAttendees = event.attendees.filter(attendee => attendee.approvalStatus === 'approved');
        return res.status(200).json({ approvedAttendees });


    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
});
eventRouter.put('/rejectAttendee/:eventId/:userId', async (req, res) => {
    try {
        const { eventId, userId } = req.params;
        const token = req.header('auth-token');
        if (!token) return res.status(401).json({ message: 'Unauthorized' });
        const user = jwt.verify(token, process.env.JWT_SECRET);
        if (!user) return res.status(401).json({ message: 'Invalid token' });
        const event = await eventModel.findById(eventId);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        if (event.hostedBy.toString() !== user.id) return res.status(403).json({ message: 'Unauthorized to reject attendees for this event' });
        const attendee = event.attendees.find(attendee => attendee.user.toString() === userId);
        if (!attendee) return res.status(404).json({ message: 'Attendee not found' });
        attendee.approvalStatus = 'rejected';
        await event.save();
        return res.status(200).json({ message: 'Attendee rejected successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
});
eventRouter.put('/approveAllAttendees/:eventId', async (req, res) => {
    try {
        const { eventId } = req.params;
        const token = req.header('auth-token');
        if (!token) return res.status(401).json({ message: 'Unauthorized' });
        const user = jwt.verify(token, process.env.JWT_SECRET);
        const event = await eventModel.findById(eventId);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        if (event.hostedBy.toString() !== user.id) return res.status(403).json({ message: 'Unauthorized to approve attendees for this event' });
        event.attendees.forEach(attendee => {
            attendee.approvalStatus = 'approved';
        });
        await event.save();
        res.status(200).json({ message: 'All attendees approved successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });

    }
});
eventRouter.put('/approveAttendee/:eventId/:userId', async (req, res) => {
    try {
        const { eventId, userId } = req.params;

        // Verify the token
        const token = req.header('auth-token');
        if (!token) return res.status(401).json({ message: 'Unauthorized' });

        const user = jwt.verify(token, process.env.JWT_SECRET);
        if (!user) return res.status(401).json({ message: 'Invalid token' });

        // Find the event by ID
        const event = await eventModel.findById(eventId);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        // Check if the requester is the event host
        if (event.hostedBy.toString() !== user.id) return res.status(403).json({ message: 'Unauthorized to approve attendees for this event' });

        // Find the attendee within the event's attendees
        const attendee = event.attendees.find(attendee => attendee.user.toString() === userId);
        if (!attendee) return res.status(404).json({ message: 'Attendee not found' });

        // Update the approval status to 'approved'
        attendee.approvalStatus = 'approved';
        await event.save();

        return res.status(200).json({ message: 'Attendee approved successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
});


module.exports = eventRouter;
