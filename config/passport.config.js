const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const {User} = require('../src/models/index')
const {secret} = require('./app.config')

module.exports = function(passport){
  const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: secret,
  }

  passport.use(new JwtStrategy(options, async function(jwt_payload, done) {
    console.log('payload')
    console.log(jwt_payload)
    console.log('end of payload')
    try {
      let user = await User.findByPk(jwt_payload.sub)
      // Authenticated
      if (user) return done(null, user)
      // Wrong Token
      else return done(null, false, {message: 'Authentication Error'})
    } catch (err) {
      return done(err, false)
    }
  }))
}