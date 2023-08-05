const router = require('express').Router();
const usersController = require('../controllers/users');
const { validateUserData } = require('../middlewares/validate');

router.get('/me', usersController.getUser);
router.patch('/me', validateUserData, usersController.patchUser);

module.exports = router;
