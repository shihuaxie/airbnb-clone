const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const imageDownloader = require('image-downloader');
const multer = require('multer');
const fs = require("fs");
const User = require('./models/User');
const Place = require('./models/Place');
const Booking = require('./models/Booking');


require('dotenv').config()
const app = express();

const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = 'ak7hffieu3ybcxbajk5vf';

//middleware
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname + '/uploads'));
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
            const {name, email, _id} = await User.findById(userData.id);
            res.json({name, email, _id});
        });
    } else {
        res.json(null);
    }
})

// logout
app.post('/logout', (req, res) => {
    res.cookie('token', '').json(true);
})

//upload photo by link
app.post('/upload-by-link', async (req, res) => {
    const {link} = req.body;
    const newName = 'photo' + Date.now() + '.jpg';
    await imageDownloader.image({
        url: link,
        dest: __dirname + '/uploads/' + newName,
    });
    res.json(newName);
})

//upload photo by files
const photosMiddleware = multer({dest: 'uploads/'});
app.post('/upload', photosMiddleware.array('photos', 100), async (req, res) => {
    const uploadFiles = [];
    for (let i = 0; i < req.files.length; i++) {
        const {path, originalname} = req.files[i];
        const parts = originalname.split('.');
        const ext = parts[parts.length - 1];
        const newPath = path + '.' + ext;
        fs.renameSync(path, newPath);
        uploadFiles.push(newPath.replace('uploads/', ''));
    }
    res.json(uploadFiles);
});


//add new place
app.post('/places', (req, res) => {
    const {token} = req.cookies;
    const {
        title, address, photos: addedPhotos,
        description, price, perks, extraInfo,
        checkOut, checkIn, maxGuests
    } = req.body;
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        if (err) throw err;
        const placeDoc = await Place.create({
            owner: userData.id, price,
            title, address, photos: addedPhotos,
            description, perks, extraInfo,
            checkOut, checkIn, maxGuests,
        });
        res.json(placeDoc);
    });
})

app.get('/user-places', (req, res) => {
    const {token} = req.cookies;
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        const {id} = userData;
        res.json(await Place.find({owner: id}))
    })
})

//redirect to the places we saved
app.get('/places/:id', async (req, res) => {
    const {id} = req.params;
    res.json(await Place.findById(id))
})

//update the saved place
app.put('/places', async (req, res) => {
    const {token} = req.cookies;
    const {
        id, title, address, addedPhotos,
        description, perks, extraInfo,
        checkOut, checkIn, maxGuests, price,
    } = req.body;

    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        if (err) throw err;
        const placeDoc = await Place.findById(id);
        if (userData.id === placeDoc.owner.toString()) {
            //console.log({price})
            placeDoc.set({
                title, address, photos: addedPhotos,
                description, perks, extraInfo,
                checkOut, checkIn, maxGuests, price,
            });
            placeDoc.save();
            res.json('ok');
        }
    })
})

//index page
app.get('/places', async (req, res) => {
    res.json(await Place.find());
})

//bookings
app.post('/bookings', (req, res) => {
    const {place, checkIn, checkOut, name, mobile, guestsNum, price} = req.body;
    Booking.create({
        place, checkIn, checkOut, name, mobile, guestsNum, price
    }).then((doc) => {
        res.json(doc);
    }).catch((err) => {
            throw err;
        }
    )
})

app.listen(4000);

// uKHsbF5EeiSpYu6o