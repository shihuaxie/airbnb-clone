const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const User = require('./models/User');
require('dotenv').config()
const app = express();

const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = 'ak7hffieu3ybcxbajk5vf';

//middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    credentials: true,
    origin: 'http://127.0.0.1:5173',
}))

//DeprecationWarning:DeprecationWarning:
mongoose.set("strictQuery", false);
// connect to my mangodb
mongoose.connect(process.env.MONGO_URL);

app.get('/test', (req, res) => {
    res.json('test ok')
});

// register user
app.post('/register', async (req, res) => {
    const {name, email, password} = req.body;
    try {
        const userDoc = await User.create({
            name,
            email,
            password: bcrypt.hashSync(password, bcryptSalt),
        });
        res.json(userDoc);
    } catch (err) {
        res.status(422).json(err);
    }
})

// login user
app.post('/login', async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const userDoc = await User.findOne({email})

    if (userDoc) {
        const pwdOk = bcrypt.compareSync(password, userDoc.password);
        if (pwdOk) {
            jwt.sign(
                {
                    email: userDoc.email,
                    id: userDoc._id
                }, jwtSecret, {}, (err, token) => {
                    if (err) throw err;
                    res.cookie('token', token).json(userDoc);
                });

        } else {
            res.status(422).json('pwd not ok');
        }
    } else {
        res.json('Not found');
    }
})


app.get('/profile', (req, res) => {

    const {token} = req.cookies;

    if (token) {
        jwt.verify(token, jwtSecret, {}, async (err, userData) => {
            if (err) throw err;
            const {name,email, _id}= await User.findById(userData.id);
            res.json({name,email, _id});
        });
    } else {
        res.json(null);
    }
})

app.listen(4000);

// uKHsbF5EeiSpYu6o