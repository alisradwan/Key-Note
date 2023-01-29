//const User = require('../models/user);
const querystring = require('querystring');
//const axios = require('axios');
const jwt = require('jsonwebtoken');
//const router = express.Router();

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

module.exports = {
 login(req, res) {
    res.redirect(`https://accounts.spotify.com/authorize?${querystring.stringify({
        response_type: 'code',
        client_id: process.env.SPOTIFY_CLIENT_ID,
        scope: scopes,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
        state: req.params.id
    })}`);
 },

 callback(req, res) {
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
 },

 refresh(req, res) {
    User.findById(req.params.id, (err, user) => {
        if (user.tokenExpiration - Date.now() < 0 ) {
            const refresh_token = user.spotifyRefresh;
            const authOptions = {
                url: 'https://accounts.spotify.com/api/token',
                headers: {'Authorization': 'Basic ' + (new Buffer(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64'))},
                form: {
                    grant_type: 'refresh_token',
                    refresh_token: refresh_token
                },
                json: true
            };
            request.post(authOptions, function(err, response, body) {
                if (!err && response.statusCode === 200) {
                    let spotifyToken = body.access_token;
                    let tokenExpiration = body.expires_in * 1000 + Date.now();
                    User.findByIdAndUpdate(user.id, {spotifyToken, tokenExpiration}, {new: true}, function(err, updatedUser) {
                        return res.send({
                            user: updatedUser
                        });
                    })
                }
            })
        }
        else {
            return res.send({user})
        }
    })
 },

 getSingleUser(req, res) {
    User.findById(req.params.id, function(err, user) {
        const access_token = user.spotifyToken;
        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + access_token 
        };
        const options = {
            url: 'https://api.spotify.com/v1/me',
            headers: headers
        };
        function callback(error, response, body) {
            if (!error && response.statusCode == 200) {
                let parsed = JSON.parse(body);
                let spotifyId = parsed.id;
                User.findByIdAndUpdate(user.id, {spotifyId}, {new: true}, function(err, updatedUser) {
                    res.send({user: updatedUser});
                })
            }
        }
        request(options, callback);        
    })
 },

 getTracks(req, res) {
    let tracks = [];
    User.findById(req.params.id, function(err, user) {
        const access_token = user.spotifyToken;
        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + access_token 
        };
        const options = {
            url: 'https://api.spotify.com/v1/me/tracks?limit=50',
            headers: headers
        };
        function callback(error, response, body) {
            if (!error && response.statusCode == 200) {
                let parsed = JSON.parse(body);
                parsed.items.forEach(track => {
                    tracks.push({
                        track: track.track.name,
                        artist: track.track.album.artists.map(artist => artist.name).join(', '),
                        artistId: track.track.album.artists[0].id,
                        album: track.track.album.name,
                        length: track.track.duration_ms,
                        uri: track.track.uri,
                        trackId: track.track.id,
                        albumId: track.track.album.id,
                    })
                })
                res.send({tracks})
            }
        }
        request(options, callback);
    })
 },

 getAlbums(req, res) {
    let albums = [];
    User.findById(req.params.id, function(err, user) {
        const access_token = user.spotifyToken;
        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + access_token 
        };
        const options = {
            url: 'https://api.spotify.com/v1/me/albums?limit=50',
            headers: headers
        };
        function callback(error, response, body) {
            if (!error && response.statusCode == 200) {
                let parsed = JSON.parse(body);
                parsed.items.forEach(album => {
                    albums.push({
                        title: album.album.name,
                        artist: album.album.artists.map(artist => artist.name).join(', '),
                        img: album.album.images[0].url,
                        id: album.album.id,
                    })
                })
                res.send({albums})
            }
        }
        request(options, callback);
    })
 },

 getSingleAlbum(req, res) {
    let tracks = [];
    let album = {}
    User.findById(req.params.id, function(err, user) {
        const access_token = user.spotifyToken;
        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + access_token 
        };
        const options = {
            url: `https://api.spotify.com/v1/albums/${req.params.albumId}`,
            headers: headers
        };
        function callback(error, response, body) {
            if (!error && response.statusCode == 200) {
                let parsed = JSON.parse(body);
                parsed.tracks.items.forEach(track => {
                    tracks.push({
                        track: track.name,
                        artist: track.artists.map(artist => artist.name).join(', '),
                        artistId: track.artists[0].id,
                        album: parsed.name,
                        length: track.duration_ms,
                        uri: track.uri,
                        trackId: track.id
                    })
                })
                album.img = parsed.images[0].url; 
                album.name = parsed.name;
                album.artist = parsed.artists.map(artist => artist.name).join(', ');
                album.year = parsed.release_date.slice(0, 4);
                album.count = parsed.total_tracks;
                album.length = tracks.reduce((acc, val) => (acc + val.length), 0); 
                res.send({album, tracks})
            }
        }
        request(options, callback);
    })
 },

 getPlaylists(req, res) {
    let playlists = [];
    User.findById(req.params.id, function(err, user) {
        const access_token = user.spotifyToken;
        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + access_token 
        };
        const options = {
            url: 'https://api.spotify.com/v1/me/playlists',
            headers: headers
        };
        function callback(error, response, body) {
            if (!error && response.statusCode == 200) {
                let parsed = JSON.parse(body);
                parsed.items.forEach(playlist => {
                    playlists.push({
                        title: playlist.name,
                        id: playlist.id,
                        img: playlist.images[0].url,
                        owner: playlist.owner.display_name,
                        ownerId: playlist.owner.id,    
                    })
                })
                res.send({playlists});
            }
        }
        request(options, callback);
    })
 },

 getSinglePlaylist(req, res) {
    let tracks = [];
    let playlist = {}
    User.findById(req.params.id, function(err, user) {
        const access_token = user.spotifyToken;
        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + access_token 
        };
        const options = {
            url: `https://api.spotify.com/v1/playlists/${req.params.playlistId}/tracks?offset=0&limit=100`,
            headers: headers
        };
        function callback(error, response, body) {
            if (error) console.log(error);
            if (!error && response.statusCode == 200) {
                let parsed = JSON.parse(body);
                parsed.items.forEach(track => {
                    tracks.push({
                        track: track.track.name,
                        artist: track.track.artists.map(artist => artist.name).join(', '),
                        artistId: track.track.artists[0].id,
                        album: track.track.album.name,
                        length: track.track.duration_ms,
                        uri: track.track.uri,
                        trackId: track.track.id,
                        albumId: track.track.album.id
                    })
                })
                playlist.count = tracks.length;
                playlist.length = tracks.reduce((acc, val) => (acc + val.length), 0); 
                res.send({playlist, tracks});
            }
        }
        request(options, callback);
    })
 },

}