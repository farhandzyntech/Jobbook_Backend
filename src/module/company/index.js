const express = require("express");
//--//
let routes = function(){
    const router = express();
    //--//
    router.use("/home", require("./routes/home")());
    router.use("/job", require("./routes/job")());
    //--//
    return router;
};
module.exports = routes;