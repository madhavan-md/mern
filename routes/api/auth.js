const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const config = require("config");
const { check, validationResult } = require('express-validator');

// @route GET api/auth
// @desc Test route
// @access public 
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        console.log('-------------',user);
        res.json(user);
    } catch (err) {
        console.log(err.message);
        res.status(500).send('server error');
    }
});

// @route GET api/users
// @desc User auth
// @access public 
router.post('/',
    [
        check('email', 'Please include valid email').isEmail(),
        check('password', 'Password is required').exists()

    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { email, password } = req.body;
        try {
            // See if user already exists
            let user = await User.findOne({ email: email });
            if (!user) {
                res.status(400).json({ errors: [{ msg: 'Invalid user credentials---' }] });
            }
            
            const isValidUser = await bcrypt.compare(password, user.password); 
            if(!isValidUser){
                res.status(400).json({ errors: [{ msg: 'Invalid user credentials' }] });
            }
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