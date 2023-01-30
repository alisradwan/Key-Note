const SpotifyWebApi = require("spotify-web-api-node");
const querystring = require("querystring");
require('dotenv').config();

const credentials = {
	clientId: process.env.SPOTIFY_CLIENT_ID,
	clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
	redirectUri: process.env.SPOTIFY_REDIRECT_URI,
};

const spotifyApi = new SpotifyWebApi(credentials);

function refreshToken(req, res) {
    spotifyApi.refreshAccessToken().then (
        function (data) {
            console.log('The access token has been refreshed!');
            spotifyApi.setAccessToken(data.body["access_token"]);
        },
        function (res) {
            console.log('Could not refresh access token', err);
        },
    )
};

function generateRandomString(length) {
	let text = ""
	const possible =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

	for (let i = 0; i < length; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length))
	}
	return text
};

function login (req, res) {
    const scopes = [
		"streaming",
		"user-read-private",
		"user-read-email",
		"user-read-playback-state",
		"user-library-read",
		"playlist-read-private",
		"playlist-modify-public",
		"playlist-modify-private",
	]
    const state = generateRandomString(16)
    const showDialog = true;
    const responseType = 'token';
    const authorizeURL = spotifyApi.createAuthorizeURL(scopes, state, showDialog, responseType);

    console.log (authorizeURL);
    res.redirect(authorizeURL);
};

function callback (req, res) {
    const  {code} = req.query
    spotifyApi.authorizationCodeGrant(code).then(
        function (data) {
            const { access_token, refresh_token } = data.body
            spotifyApi.setAccessToken(access_token)
            spotifyApi.setRefreshToken(refresh_token)

            res.redirect('/')
        },
        function (err) {
            res.redirect("/#/error/invalid token")
        }
    )
};

module.exports = { refreshToken, login, callback }