const router = require('express').Router();
const spotifyRoutes = require('./spotifyRoutes');

router.use("/", spotifyRoutes); 

router.use((req, res) => res.send('Wrong route!'));

module.exports = router;