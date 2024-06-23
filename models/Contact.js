// const mongoose = require('mongoose');

// models/Contact.js

const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true
    },
    email: {
        type: String,
        default: null
    },
    linkedin: {
        type: String,
        default: null
    },
    twitter: {
        type: String,
        default: null
    }
});

module.exports = mongoose.model('Contact', ContactSchema);
