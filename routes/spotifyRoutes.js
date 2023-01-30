const router = require("express").Router();

const {
    searchArtists,
    searchTracks
} = require("../controllers/spotifyController");

router.route('/tracks/:id').get(searchTracks);
router.route('/artists/:id').get(searchArtists);


module.exports = router;