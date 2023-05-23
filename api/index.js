const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config()
const app = express();

const bcryptSalt = bcrypt.genSaltSync(10)

app.use(express.json());
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
app.post('/login', async (req, res) =>{
    const [email, password] = req.body;
    const userDoc = await User.findOne({email})

    if(userDoc) {
        res.json('Found');
    } else{
        res.json('Not found');
    }
})
app.listen(4000);

// uKHsbF5EeiSpYu6o