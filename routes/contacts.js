const express = require('express');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const Contact = require('../models/Contact');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
const algorithm = 'aes-256-ctr';
const secretKey = process.env.SECRET_KEY;

const encrypt = (text) => {
    const cipher = crypto.createCipheriv(algorithm, secretKey, Buffer.from(secretKey.slice(0, 16)));
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
    return encrypted.toString('hex');
};

const decrypt = (hash) => {
    const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(secretKey.slice(0, 16)));
    const decrypted = Buffer.concat([decipher.update(Buffer.from(hash, 'hex')), decipher.final()]);
    return decrypted.toString();
};

// Create Contact API
router.post('/create', authMiddleware, async (req, res) => {
    const { name, phone, email, linkedin, twitter } = req.body;

    const newContact = new Contact({
        id: uuidv4(),
        name: encrypt(name),
        phone,
        email: email ? encrypt(email) : null,
        linkedin: linkedin ? encrypt(linkedin) : null,
        twitter: twitter ? encrypt(twitter) : null
    });

    try {
        await newContact.save();
        res.json({ message: 'Contact created successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error creating contact', error: err.message });
    }
});

// Edit Contact API
router.put('/edit', authMiddleware, async (req, res) => {
    const { name, email, linkedin, twitter } = req.body;

    try {
        const contact = await Contact.findOne({ name: encrypt(name) });

        if (!contact) {
            return res.status(404).json({ message: 'Contact not found' });
        }

        if (email) contact.email = encrypt(email);
        if (linkedin) contact.linkedin = encrypt(linkedin);
        if (twitter) contact.twitter = encrypt(twitter);

        await contact.save();
        res.json({ message: 'Contact updated successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error updating contact', error: err.message });
    }
});

// Search Contact API
router.post('/search', authMiddleware, async (req, res) => {
    const { search_token } = req.body;

    try {
        const contacts = await Contact.find();
        const results = contacts.filter(contact => decrypt(contact.name).includes(search_token)).map(contact => ({
            id: contact.id,
            name: decrypt(contact.name),
            phone: contact.phone,
            email: contact.email ? decrypt(contact.email) : null,
            linkedin: contact.linkedin ? decrypt(contact.linkedin) : null,
            twitter: contact.twitter ? decrypt(contact.twitter) : null
        }));

        if (results.length === 0) {
            return res.status(404).json({ message: 'No contacts found' });
        }

        res.json(results);
    } catch (err) {
        res.status(500).json({ message: 'Error searching contacts', error: err.message });
    }
});

module.exports = router;
