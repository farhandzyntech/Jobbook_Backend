const express = require("express");
const News = require("../../../schemas/News");
const newsController = require("../../../controllers/news");
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

const advancedResults = require('../../../middleware/advancedResults');
const { protect, authorize } = require('../../../middleware/auth');
//--//
let routes = function(){
    let routes = express.Router({mergeParams: true});
    //--//
    routes.route("/create").post([protect], authorize('talent'), upload.single('picture'), newsController.create);
    routes.route("/fetch").get([protect], authorize('talent'), advancedResults(News, {path: 'user', select: 'name' }), newsController.fetch);
    routes.route("/update/:id").put([protect], authorize('talent'), upload.single('picture'), newsController.update);
    routes.route("/delete/:id").delete([protect], authorize('talent'), newsController.delete);
    //--//
    return routes;
};
//--//
module.exports = routes;