const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const User = require('../../models/User');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const config = require("config");

// @route GET api/users
// @desc User registration
// @access public 
router.post('/',
    [
        check('name', 'Name is required').not().isEmpty(),
        check('email', 'Please include valid email').isEmail(),
        check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })

    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { name, email, password } = req.body;
        try {
            // See if user already exists
            let user = await User.findOne({ email: req.body.email });
            if (user) {
                res.status(400).json({ errors: [{ msg: 'User already exists' }] });
            }
            const avator = await gravatar.url(req.body.email, {
                s: '200', // Size
                r: 'pg', // Rating
                d: 'mm' // Default
            });
            user = new User({
                name,
                email,
                avator,
                password
            });

            // Encrypt password
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
            await user.save();
            // Return jsonwebtoken 
            const payload = {
                user: {
                    id: user.id
                }
            }

            jwt.sign(
                payload,
                config.get("jwtToken"),
                { expiresIn: 36000 },
                (err, token) => {
                    if (err) throw err;
                    res.json({ token });
                });

        } catch (err) {
            res.status(500).send("Server error");
        }
    });

module.exports = router;