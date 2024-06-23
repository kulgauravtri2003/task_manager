const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const mockUser = {
    username: 'saltman',
    password: 'oai1122'
};

router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (username === mockUser.username && password === mockUser.password) {
        const token = jwt.sign({ username: mockUser.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
});

module.exports = router;
