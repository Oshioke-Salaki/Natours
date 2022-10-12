const express = require('express');
const userController = require('./../Controllers/userController');
const authController = require('./../Controllers/authController');

const router = express.Router();

router.route('/signup').post(authController.signup);
router.post('/login', authController.login);

router
    .route('/')
    .get(userController.getAllUsers)
    .post(userController.createUser);

router
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.UpdateUser)
    .delete(userController.deleteUser);

module.exports = router;