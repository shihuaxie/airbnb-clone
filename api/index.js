const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const imageDownloader = require('image-downloader');
const {S3Client, PutObjectCommand} = require('@aws-sdk/client-s3');
const fs = require("fs");
const User = require('./models/User');
const Place = require('./models/Place');
const Booking = require('./models/Booking');
const multer = require("multer");
const mime = require('mime-types');


require('dotenv').config()
const app = express();

const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = 'ak7hffieu3ybcxbajk5vf';
const bucket = 'sylvia-booking-app';

//get user data from token func
function getUserDataFromReq(req) {
    return new Promise((resolve, reject) => {
        jwt.verify(req.cookies.token, jwtSecret, {}, async (err, userData) => {
            if (err) throw err;
            resolve(userData)
        });
    });
}

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

//upload photos to aws s3 func
async function uploadToS3(path, originalFilename, mimetype) {
    const client = new S3Client({
        region: 'ap-southeast-2',
        credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY,
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
        },
    });
    const parts = originalFilename.split('.');
    const ext = parts[parts.length - 1];
    const newFilename = Date.now() + '.' + ext;

    await client.send(new PutObjectCommand({
        Bucket: bucket,
        Body: fs.readFileSync(path),
        Key: newFilename,
        ContentType: mimetype,
        ACL: 'public-read',
    }))
    return `https://${bucket}.s3.amazonaws.com/${newFilename}`;
}

app.get('/api/test', (req, res) => {
    // connect to my mangodb
    mongoose.connect(process.env.MONGO_URL);
    res.json('test ok')
});

// register user
app.post('/api/register', async (req, res) => {
    // connect to my mangodb
    mongoose.connect(process.env.MONGO_URL);
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
app.post('/api/login', async (req, res) => {
    // connect to my mangodb
    mongoose.connect(process.env.MONGO_URL);
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


app.get('/api/profile', (req, res) => {
// connect to my mangodb
    mongoose.connect(process.env.MONGO_URL);

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
app.post('/api/logout', (req, res) => {
    res.cookie('token', '').json(true);
})

//upload photo by link
app.post('/api/upload-by-link', async (req, res) => {
    const {link} = req.body;
    const newName = 'photo' + Date.now() + '.jpg';
    await imageDownloader.image({
        url: link,
        dest: '/tmp/' + newName,
    });
    const url = await uploadToS3('/tmp/' + newName, newName, mime.lookup('/tmp/' + newName))
    res.json(url);
})

//upload photo by files
const photosMiddleware = multer({dest: '/tmp'});
app.post('/api/upload', photosMiddleware.array('photos', 100), async (req, res) => {
    const uploadFiles = [];
    for (let i = 0; i < req.files.length; i++) {
        const {path, originalname, mimetype} = req.files[i];
        const url = await uploadToS3(path, originalname, mimetype);
        uploadFiles.push(url);
    }
    res.json(uploadFiles);
});


//add new place
app.post('/api/places', (req, res) => {
    // connect to my mangodb
    mongoose.connect(process.env.MONGO_URL);
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

app.get('/api/user-places', (req, res) => {
    // connect to my mangodb
    mongoose.connect(process.env.MONGO_URL);
    const {token} = req.cookies;
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        const {id} = userData;
        res.json(await Place.find({owner: id}))
    })
})

//redirect to the places we saved
app.get('/api/places/:id', async (req, res) => {
    // connect to my mangodb
    mongoose.connect(process.env.MONGO_URL);
    const {id} = req.params;
    res.json(await Place.findById(id))
})

//update the saved place
app.put('/api/places', async (req, res) => {
    // connect to my mangodb
    mongoose.connect(process.env.MONGO_URL);
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
app.get('/api/places', async (req, res) => {
    // connect to my mangodb
    mongoose.connect(process.env.MONGO_URL);
    res.json(await Place.find());
})

//post bookings
app.post('/api/bookings', async (req, res) => {
    // connect to my mangodb
    mongoose.connect(process.env.MONGO_URL);
    const userData = await getUserDataFromReq(req);
    const {place, checkIn, checkOut, name, mobile, guestsNum, price} = req.body;
    Booking.create({
        place, checkIn, checkOut, name, mobile, guestsNum, price,
        user: userData.id,
    }).then((doc) => {
        res.json(doc);
    }).catch((err) => {
            throw err;
        }
    )
})

//get bookings
app.get('/api/bookings', async (req, res) => {
    // connect to my mangodb
    mongoose.connect(process.env.MONGO_URL);
    const userData = await getUserDataFromReq(req);
    res.json(await Booking.find({user: userData.id}).populate('place'));
})

app.listen(process.env.API_PORT);

// uKHsbF5EeiSpYu6o