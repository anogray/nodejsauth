const httpRouter = require("express").Router();


httpRouter.get("/",(req,res)=>{

    console.log("got the httpOnly")
    let data = {dt:"apple"};
    return res.cookie("htData", data, { httpOnly:false, sameSite:"none", secure:"auto"}).send();
})

module.exports = httpRouter;