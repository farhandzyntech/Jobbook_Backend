const express = require("express");
const authController = require("../controllers/auth");
const multer  = require('multer')
const mimetype = require('mime-types')

//--//
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
        let extention = mimetype.extension(file.mimetype);
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9) + "."+extention
        cb(null, file.originalname + '-' + uniqueSuffix)
    }
})
const upload = multer({ storage: storage });
//--//

const { protect } = require('../../../middleware/auth');
//--//
let routes = function(){
    let routes = express.Router({mergeParams: true});
    //--//
    routes.route("/signup").post(upload.single('picture'), authController.signup);
    routes.route("/signup/facebook").post(authController.signupFacebook);
    routes.route("/signup/google").post(authController.signupGoogle);
    routes.route("/signup/apple").post(authController.signupApple);
    //--////////////////////////////////
    routes.route("/login").post(authController.login);
    routes.route('/sociallogin').post(authController.socialLogin);
    routes.route("/logout").post([protect], authController.logout);
    //--////////////////////////////////
    routes.route("/confirmemail").get(authController.confirmEmail);
    routes.route("/otp").post(authController.generateOtp);
    routes.route("/verify-otp").post(authController.verifyotp);
    routes.route("/forgot").post(authController.forgotPassword);
    routes.route("/resetpassword/:resettoken").put(authController.resetPassword);
    //--////////////////////////////////
    routes.route("/profile").get([protect], authController.getUserProfile);
    routes.route("/user-profile").get([protect], authController.userProfile);
    routes.route("/getAllUsers").get([protect], authController.getAllUsers);
    routes.route("/update-profile").put([protect], upload.single('picture'), authController.updateUserProfile);
    //--//
    return routes;
};
//--//
module.exports = routes;