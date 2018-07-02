var passport = require('passport');

module.exports = {

    /*
     *middleware function to check the that user is authenticated (passport-jwt)
     */
    authenticate: function(req, res, next) {

        passport.authenticate('jwt', function(err, user) {
            if (err) {
                console.log(err);
            }
            if (!user) {
                return res.status(401).json({
                    status: false,
                    message: "Authentication Failed"
                });
            }
            if (user) {

                return next(user);

            }
        })(req, res, next)
    }
}