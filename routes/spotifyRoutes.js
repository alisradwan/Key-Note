const router = require("express").Router();

const {
    login,
    refresh,
    getSingleUser,
    getTracks,
    getAlbums,
    getSingleAlbum,
    getPlaylists,
    getSinglePlaylist,
    hello1,
    searchTracks
} = require("../controllers/spotifyController");

router.route('/login/:id').get(login);
router.route('/refresh/:id').get(refresh);
router.route('/me/:id').get(getSingleUser);
router.route('/tracks/:id').get(getTracks);
router.route('/albums/:id').get(getAlbums);
router.route('/albums/:id/:albumId', getSingleAlbum);
router.route('/playlists/:id').get(getPlaylists);
router.route('/playlists/:id/:playlistId').get(getSinglePlaylist);
router.route('/hello/:artistName').get(hello1);
router.route('/tracks/:id').get(searchTracks);

module.exports = router;