const mongoose = require("mongoose");

// Pretend it's sensor data, i like iot

const templateSchema = new mongoose.Schema({
    type: {
        type: String, 
        enum: ["sensor", "evnet"], // Only allow sensor or event
        required: true,
    },
    sensorType: {
        type: String,
        enum: ["light_level", "temperature"], // Only allow light_level or temperature
        required: function () {
            return this.type === "sensor"; // Only required if type is "sensor"
        },
    },
    eventType: {
        type: String,
        enum: ["button_a_pressed", "button_b_pressed", "shaken"], // Only allow these from the array
        required: function () {
            return this.type === "event"; // Only required if the type is event
        },
    },
    value: {
        type: Number,
        required: function() {
            return this.type === "sensor"; // Only required if the type is sensor
        },
    },
    // Add more if you need more fields in the future
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

const Template = mongoose.model("Template", templateSchema);
module.exports = Template;