const express = require("express");
//--//
let routes = function(){
    const router = express();
    //--//
    router.use("/auth", require("./auth")());
    router.use("/job", require("./job")());
    //--//
    return router;
};
module.exports = routes;