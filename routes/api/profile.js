const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');

const Profile = require('../../models/Profile');
// Load User Model
const User = require('../../models/User');

// @route GET api/profile/me
// @desc get profile route
// @access private  
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'avator']);
        if (!profile) {
            return res.status(400).json({ msg: "there is no profile for this user" });
        }
        console.log(profile);
        res.json(profile);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }

});

// @route POST api/profile
// @desc profile save/update
// @access private  
router.post('/', [auth,
    [
        check('status', 'Status is required').not().isEmpty(),
        check('skills', 'Skills is required').not().isEmpty(),
    ]
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { company, website, location, bio, status, githubusername, skills, youtube, facebook, linkedin, instagram, twitter } = req.body;
    //Build profile fields
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) profileFields.skills = skills.split(',').map(skill => skill.trim());

    //Build social object
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;
    try {
        let profile = await Profile.findOne({ user: req.user.id });
        if (profile) {
            // Update 
            profile = await Profile.findOneAndUpdate({ user: req.user.id }, { $set: profileFields }, { new: true });
            return res.json(profile);
        }
        // Create
        profile = new Profile(profileFields);
        await profile.save();
        res.json(profile);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }

});

// @route GET api/profile/all
// @desc get all profile 
// @access private  
router.get('/all', auth, async (req, res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avator'])
        if (!profiles) {
            res.status(404).send('There is no profiles');
        }
        res.send(profiles);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});


// @route GET api/profile
// @desc get  profile by user ID 
// @access private  
router.get('/user/:user_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name', 'avator'])
        if (!profile) {
            res.status(404).send('Profile not found');
        }
        res.send(profile);
    } catch (err) {
        console.error(err);
        if (err.kind == "ObjectId") {
            return res.status(404).json({ msg: 'Profile not found' });
        }
        res.status(500).send('Server error');
    }
});

// @route GET api/profile
// @desc delete profile, user $ post 
// @access private  
router.delete('/', auth, async (req, res) => {
    try {
        await Profile.findOneAndDelete({ user: req.user.id });
        await User.findOneAndDelete({ _id: req.user.id });
        res.json({ msg: "User deleted" });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});
// @route   POST api/profile/experience
// @desc    Add experience to profile
// @access  Private
router.post('/experience', [auth,
    [
        check('title', 'title is required').not().isEmpty(),
        check('company', 'company is required').not().isEmpty(),
        check('from', 'from is required').not().isEmpty()
    ]
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const profile = await Profile.findOne({ user: req.user.id });
        const newExp = {
            title: req.body.title,
            company: req.body.company,
            location: req.body.location,
            from: req.body.from,
            to: req.body.to,
            current: req.body.current,
            description: req.body.description
        };
        profile.experience.unshift(newExp);
        await profile.save();
        res.json(profile);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});
// @route   POST api/profile/education
// @desc    Delete education from profile
// @access  Private
router.delete('/experience/:exp_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });
        const removedIndex = profile.experience.map(item=> item.id).indexOf(req.params.exp_id);
        profile.experience.splice(removedIndex, 1);
        await profile.save();
        res.json(profile);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// @route   POST api/profile/education
// @desc    Add education to profile
// @access  Private
router.post('/education', [auth,
    [
        check('school', 'school is required').not().isEmpty(),
        check('fieldofstudy', 'fieldofstudy is required').not().isEmpty(),
        check('from', 'from is required').not().isEmpty()
    ]
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const profile = await Profile.findOne({ user: req.user.id });
        const newExp = {
            school: req.body.school,
            fieldofstudy: req.body.fieldofstudy,
            degree: req.body.degree,
            from: req.body.from,
            to: req.body.to,
            current: req.body.current,
            description: req.body.description
        };
        profile.education.unshift(newExp);
        await profile.save();
        res.json(profile);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});
// @route   POST api/profile/education
// @desc    Delete education from profile
// @access  Private
router.delete('/education/:edu_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });
        const removedIndex = profile.education.map(item=> item.id).indexOf(req.params.exp_id);
        profile.education.splice(removedIndex, 1);
        await profile.save();
        res.json(profile);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

module.exports = router;

