const passport = require("passport");
const JWTstrategy = require("passport-jwt").Strategy;

const UserModel = require("../models/User");

module.exports = () => {
    const options = {
        secretOrKey: process.env.JWT_SECRET,
        jwtFromRequest: (req) => {
            let token = null;
            if (req && req.cookies) {
                token = req.cookies[process.env.COOKIE_SECRET];
            }
            return token;
        },
    };

    passport.use(
        new JWTstrategy(options, async (token, done) => {
            const user = await UserModel.findOne({ _id: token.user._id });
            if (user) return done(null, user);

            return done(null, false);
        })
    );


    passport.serializeUser(function (user, done) {
        done(null, user);
    });

    passport.deserializeUser(function (obj, done) {
        done(null, obj);
    });
};
