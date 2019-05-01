const mongoose = require('mongoose');
const passport = require('passport');
const router = require('express').Router();
const auth = require('../auth');
const Users = mongoose.model('users');
const bodyParser = require("body-parser");
router.use(bodyParser.json());

//POST new user route (optional, everyone has access)
router.post('/', auth.optional, (req, res, next) => {
    //const { body: { user } } = req;
    const user = req.body;  // request the body not the request the entire post. 

    if (!user.email) {
        return res.status(422).json({
            errors: {
                email: 'is required',
            },
        });
    }

    if (!user.password) {
        return res.status(422).json({
            errors: {
                password: 'is required',
            },
        });
    }

    const finalUser = new Users(user);

    finalUser.setPassword(user.password);
    //console.log(user.password);
    return finalUser.save()
        .then(() => res.json({ user: finalUser.toAuthJSON() }));

});

//POST login route (optional, everyone has access)
router.post('/login', auth.optional, (req, res, next) => {
    //const { body: { user } } = req;
    const user = req.body;

    if (!user.email) {
        console.log("email error");
        return res.status(422).json({
            errors: {
                email: 'is required',
            },
        });
    }

    if (!user.password) {
        console.log("password error");
        return res.status(422).json({
            errors: {
                password: 'is required',

            },
        });

    }

    return passport.authenticate('local', { session: false }, (err, passportUser, info) => {
        if (err) {
            return next(err);
        }

        if (passportUser) {
            const user = passportUser;
            user.token = passportUser.generateJWT();
            console.log(user.token);
            return res.json({ user: user.toAuthJSON() });
        }

        return status(400).info;
    })(req, res, next);
});

//GET current route (required, only authenticated users have access)
router.get('/current', auth.required, (req, res, next) => {
    const { payload: { id } } = req;
    // const id = req.payload;

    return Users.findById(id)
        .then((user) => {
            if (!user) {
                return res.sendStatus(400);
            }

            return res.json({ user: user.toAuthJSON() });
        });
});

module.exports = router;