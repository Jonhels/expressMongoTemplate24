const Template = require("../models/templateSchema");

// Post incoming data to the database
const templatePost = async (req, res) => {
    try {
        // Get information from request body (incoming)
        const { type, sensorType, eventType, timestamp, value } = req.body;
        // New object with information from request
        const newTemplateObject = new TemplateObject ({
            type,
            sensorType,
            eventType,
            timestamp,
            value,
        });

        // Save it to the database
        await newTemplateObject.save();

        // Send response to the client
        res.status(201).json({
            message: "Template data created successfully",
            data: newTemplateObject,
        });
    } catch (error) {
        // If any errors, send response to the client
        res.status(400).json({message: error.message});
    }
};

// Get all template data from the database
const getAllTemplateData = async (req, res) => {
    try {
        // Fetch all the template data from the database
        const templateData = await Template.find();
        res.status(200).json(templateData);
    } catch (error) {
        res.status(500).json({message: "Failed to get Template data"});
    }
};

// Add more functionalities here in the controller

module.exports = {templatePost, getAllTemplateData};