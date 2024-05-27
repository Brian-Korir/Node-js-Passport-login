const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/User');

module.exports = function(passport) {
    // Local Strategy configuration
    passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
        // Find user by email
        User.findOne({ email: email })
            .then(user => {
                if (!user) {
                    return done(null, false, { message: 'This email is not registered' });
                }
                // Compare passwords
                user.comparePassword(password)
                    .then(isMatch => {
                        if (isMatch) {
                            return done(null, user);
                        } else {
                            return done(null, false, { message: 'Incorrect Password' });
                        }
                    })
                    .catch(err => {
                        return done(err); // Handle password comparison error
                    });
            })
            .catch(err => {
                 done(err); // Handle database lookup error
            });
    }));

    // Serialize user into session
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });
    passport.serializeUser((user, done) => {
        console.log('Serializing user:', user);
        done(null, user.id);
    });
    // Deserialize user from session
    passport.deserializeUser((id, done) => {
        User.findById(id)
            .then(user => {
                done(null, user); // Pass user to the next middleware
            })
            .catch(err => {
                done(err, null); // Handle deserialization error
            });
    });
};
