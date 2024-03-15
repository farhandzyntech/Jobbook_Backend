const express = require("express");
//--//
let routes = function(){
    const router = express();
    //--//
    router.use("/", require("./routes/messenger")());
    //--//
    return router;
};
module.exports = routes;