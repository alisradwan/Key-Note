const router = require("express").Router();

const {
    login,
    refresh,
    getUserId,

} = require('../controllers/spotifyController');

router.route('/login/:id').get(login);
router.route('/refresh/:id').get(refresh);
router.route('/me/:id').get(getUserId);

module.exports = router;