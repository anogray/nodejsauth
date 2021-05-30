const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {

    try {

        
        const token = req.cookies.token;
        console.log("req.cookies",req.cookies,token);

        if(!token){
            return res.status(401).json({errorMessage : "Unauthorized"})   
        }
        
        const verifiedToken = jwt.verify(token, process.env.JWT_SECRET);
        console.log("verifiedToken Photos",verifiedToken);
        next();

    } catch(err){
    console.log("authError",err);
    res.status(401).json({errorMessage : "Unauthorized"})
    }
}

module.exports = auth;