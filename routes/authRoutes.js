const router = require("express").Router();

const {
    refreshToken,
    login,
    callback
} = require("../controllers/authController");

router.get("/callback", callback);
router.get("/login", login);
router.post("/refresh", refreshToken);

module.exports = router;