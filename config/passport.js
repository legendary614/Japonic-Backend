var bcrypt = require('bcryptjs');
var JwtStrategy = require('passport-jwt').Strategy;
var  ExtractJwt = require('passport-jwt').ExtractJwt;
var config = require('./config');
var promise = require('bluebird');


var options = {
  promiseLib: promise,
  error: (error, e) => {
    if (e.cn) {
      // A connection-related error;
      //
      // Connections are reported back with the password hashed,
      // for safe errors logging, without exposing passwords.
      console.log('CN: ', e.cn);
      console.log('EVENT', error.message ||  error);
    }
  }
};

var pgp = require('pg-promise')(options);



var ex = function(passport) {

   let opts = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.auth.secret,
      ignoreExpiration: false,
      algorithms: ['HS256']
   };
   passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
      var queryStr = "SELECT email from main2$customer where customercode="+`${jwt_payload.cc}`+"and email="+`${jwt_payload.cc}`+";";
      var query = pgp.as.format(queryStr);
      db.any(query)
      .then(function(err,user) {
         if(err) {
            return done(err,false);
         }
         if(user) {
            done(null,user);
         }
         else{
            done(null,false);
         }
      });
   }));
}


module.exports = ex;