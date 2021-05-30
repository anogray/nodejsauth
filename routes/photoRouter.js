const router = require("express").Router();
const Photo = require("../models/photosModel");

router.get("/", async(req, res)=>{

    console.log("sessionKiID",req.sessionID)
    req.session.destroy();
    console.log("destoryed")


try{
        const photosArr = await Photo.find().limit(10);
        console.log(photosArr);
        res.status(200).send(photosArr);
    
} catch(err){
    console.log("photosError", err);
}


})

module.exports = router;