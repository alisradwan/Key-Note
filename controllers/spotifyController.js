//const User = require('../models/user);
const querystring = require('querystring');
//const axios = require('axios');
const jwt = require('jsonwebtoken');
//const router = express.Router();
const api = require("./api");

function todaysDate() {
    let currentTime = new Date()
    let month = currentTime.getMonth() + 1
    let day = currentTime.getDate()
    let year = currentTime.getFullYear()
    return `${year}-${month}-${day}`
}

function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

const scopes = [
    'ugc-image-upload',
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing',
    'streaming',
    'app-remote-control',
    'user-read-email',
    'user-read-private',
    'playlist-read-collaborative',
    'playlist-modify-public',
    'playlist-read-private',
    'playlist-modify-private',
    'user-library-modify',
    'user-library-read',
    'user-top-read',
    'user-read-playback-position',
    'user-read-recently-played',
    'user-follow-read',
    'user-follow-modify'
];

function login(req, res) {
    res.redirect(`https://accounts.spotify.com/authorize?${querystring.stringify({
        response_type: 'code',
        client_id: process.env.SPOTIFY_CLIENT_ID,
        scope: scopes,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
        state: req.params.id
    })}`);
};

function callback(req, res) {
    const code = req.query.code;
    const id = req.query.state;
    const url = 'https://accounts.spotify.com/api/token';
    const data = {
        grant_type: "authorization_code",
        code: code,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
        client_id: process.env.SPOTIFY_CLIENT_ID,
        client_secret: process.env.SPOTIFY_CLIENT_SECRET
    }
    const options = {
        method: 'POST',
        url,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        form: data
    }
    request.post(url, options, function(err, response) {
        if (err) console.log(err);
        let body = JSON.parse(response.body);
        let tokenExpiration = body.expires_in * 1000 + Date.now();
        let accessToken = body.access_token;
        let refreshToken = body.refresh_token;
        User.findByIdAndUpdate(id, {spotifyToken: accessToken, spotifyRefresh: refreshToken, tokenExpiration}, function(err, user) {
            res.redirect('/');
        })
    })
}