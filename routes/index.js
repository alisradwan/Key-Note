const router = require('express').Router();
const spotifyRoutes = require('./spotifyRoutes');
const authRoutes = require('./authRoutes');

router.use("/", spotifyRoutes); 
router.use("/auth", authRoutes)

router.use((req, res) => res.send('Wrong route!'));

module.exports = router;