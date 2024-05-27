const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcryptjs');
const User = require('../models/User');



// Login Page
router.get('/login', (req, res) => {
    res.render('login', {
        success_msg: req.flash('success_msg') // Pass success_msg flash message to the view
    });
})

// Login Handle
router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      // ...
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        req.flash('success_msg', 'You are now logged in');
        return res.redirect('/dashboard'); // <-- Check this line
      });
    })(req, res, next);
  });
// Register Page
router.get('/register', (req, res) => {
    res.render('register', { errors: [] });
  });

// Register Handle
router.post('/register', (req, res) => {
    const { name, email, password, password2 } = req.body;
    let errors = [];

    // Check required fields
    if (!name || !email || !password || !password2) {
        errors.push({ msg: 'Please fill in all fields' });
    }

    // Check password match
    if (password !== password2) {
        errors.push({ msg: 'Passwords do not match' });
    }

    // Check password length
    if (password.length < 6) {
        errors.push({ msg: 'Password should be at least 6 characters' });
    }

    if (errors.length > 0) {
        res.render('register', {
            errors,
            name,
            email,
            password,
            password2
        });
    } else {
        // Validation passed
        User.findOne({ email: email }).then(user => {
            if (user) {
                // User exists
                errors.push({ msg: 'Email is already registered' });
                res.render('register', {
                    errors,
                    name,
                    email,
                    password,
                    password2
                });
            } else {
                const newUser = new User({
                    name,
                    email,
                    password
                });

                // Hash password
                bcrypt.genSalt(10, (err, salt) => {
                    if (err) {
                        console.error('Error generating salt:', err);
                        return res.status(500).send('Internal Server Error');
                      }
                    bcrypt.hash(newUser.password, salt, (err, hash) => {

                        if (err) {
                       console.error('Error hashing password:', err);
                         return res.status(500).send('Internal Server Error');
                            }
                        // Set password to hashed
                        newUser.password = hash;
                        // Save user
                        newUser.save()
                        .then(user => {
                            req.flash('success_msg', 'You are now registered and can log in');
                            res.redirect('/users/login');
                        })
                        .catch(err =>{
                             console.log("Error Saving the user:", err);
                             res.status(500).send('Internal Server Error');
                        });
                    });
                });
            }
        });
    }
});

// Logout Handle
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'Successfully logged out');
    res.redirect('/users/login');
});

module.exports = router;
