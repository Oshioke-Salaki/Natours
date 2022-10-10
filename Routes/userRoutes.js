const express = require("express")
const userController = require('./../Controllers/userController')

const router = express.Router()
router
    .route("/api/v1/users")
    .get(userController.getAllUsers)
    .post(userController.createUser)

router
    .route("/api/v1/users/:id")
    .get(userController.getUser)
    .patch(userController.UpdateUser)
    .delete(userController.deleteUser)


module.exports = router