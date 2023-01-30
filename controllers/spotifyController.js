const querystring = require('querystring');
//const jwt = require('jsonwebtoken');
const axios = require("axios");
var SpotifyWebApi = require('spotify-web-api-node');
require('dotenv').config();

const auth_token = Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`, 'utf-8').toString('base64');

const getAuth = async () => {
    try{
      //make post request to SPOTIFY API for access token, sending relavent info
      const token_url = 'https://accounts.spotify.com/api/token';
      const data = querystring.stringify({'grant_type':'client_credentials'});
  
      const response = await axios.post(token_url, data, {
        headers: { 
          'Authorization': `Basic ${auth_token}`,
          'Content-Type': 'application/x-www-form-urlencoded' 
        }
      })
      //return access token
      return response.data.access_token;
      //console.log(response.data.access_token);   
    }catch(error){
      //on fail, log the error in console
      console.log(error);
    }
};

// WORKING FUNCTION

async function searchArtists(req, res){
    const access_token = await getAuth(); 
    var spotifyApi = new SpotifyWebApi();

    spotifyApi.setAccessToken(access_token);

    if(!req.params.artistId){
        res.error();
    }

    console.log(req.params);

      spotifyApi.searchArtists(req.params.artistId)
      .then(function(data) {
        console.log('Search artists by "Love"', data.body);
       console.log(data.body.artists.items);
       res.send(data.body.artists);
      }, function(err) {
        console.error(err);
      });
};

async function searchTracks(req, res){
    const access_token = await getAuth(); 
    var spotifyApi = new SpotifyWebApi();

    spotifyApi.setAccessToken(access_token);

    if(!req.params.id){
        res.error();
    }

    console.log(req.params);

      spotifyApi.searchTracks(req.params.id)
      .then(function(data) {
        console.log('Search tracks by "Love"', data.body);
       console.log(data.body.artists.items);
       res.send(data.body.artists);
      }, function(err) {
        console.error(err);
      });
};

module.exports = { searchArtists, searchTracks };