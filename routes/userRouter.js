const router = require("express").Router();
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mailer = require("./mailer")

router.post("/", async(req,res)=>{
    // console.log("alldetails", typeof(req.cookies), req.cookies.details, !req.cookies.details)
        
    // let {checkotpCookie} = req.cookies.details
    // console.log({checkotpCookie})
    
   try 
    {
    console.log("main request data",req.cookies)
    
    if(!req.cookies.details){
    let {email, password, verifyPassword} = req.body;
    console.log("reqBody",req.body)

    if(!email || !password || !verifyPassword){
        return res.status(400).json({errorMessage:"aaPlease fill complete fields !"})    
    }
    else if(password.length < 6){
        return res.status(400).json({errorMessage:"Please enter password atleast with 6 characters !"})    
    }
    else if(password !== verifyPassword){
        return res.status(400).json({errorMessage:"Please enter same password as password field !"})    
    }

    const checkUser = await User.findOne({email:email});
   
    if(checkUser){
         return res.status(400).json({errorMessage:"Email is already registered !"})            
    }

     mailer(req, res);
    // let details = {email,password}
    //  res.cookie("details", details, { httpOnly:true}).send();
    return res.status(200).json("okay");
}

    //hashing the password

    else {
        console.log("otpCookie",req.cookies.details)

        // console.log("see otp session",req.session)
        
        
        // console.log("otp reqbody",req.body)
        const {otpClient} = req.body;
        const {otp} = req.cookies.details
        const {email} = req.cookies.details
        const {password} = req.cookies.details
        
        if(typeof otp === 'undefined'){
            return res.status(400).send("reload");
        }
        console.log("check",{otpClient},{otp})
        if(otp===otpClient){

            {const salt = await bcrypt.genSalt();
            const passwordHash = await bcrypt.hash(password, salt);

            const newUser = new User({
                email:email,
                hashedPassword:passwordHash
            })

                // req.session.email=email;
                // req.session.password=password;


            const savedUser = await newUser.save();

            //console.log({savedUser});
            
            //create json web token
            const token = jwt.sign(
                {
                user:savedUser._id
                },
                process.env.JWT_SECRET
            )
            
            console.log("token",token);

            //send token in HTTP-only cookie

            // res.status(200).send({
            //     "message":savedUser,
            //     "token":token
            // })
            
            console.log("thecookies",req.session.cookie)

            req.session.destroy();
        
            return res.cookie("token", token, {
                httpOnly:true
            }).send();
        }
    }
    else{
        return res.status(400).send("Invalid Otp");
    }
}
    } catch(err){
    console.error(err);
    return res.status(500).send();
  }
})



router.post("/login", async(req, res)=>{
    const details = req.cookies.details;
    console.log("triedlogin", details);
    try{

        const {email, password} = req.body;
        console.log("reqSession",req.sessionID,req.session);

        console.log({email, password})
        
        if(!email || !password){
            console.log("empty field")
             return res.status(404).json({"errorMessage":"Please fill complete fields !"})    
        }

    const checkUser = await User.findOne({email:email});
    console.log("checkUser",checkUser)
    if(!checkUser){
        console.log("TRue checkUser",checkUser)

        return res.status(400).json({errorMessage:"Email is not registered !"})            
    }

    const checkPassword =await  bcrypt.compare(password, checkUser.hashedPassword);

    if(!checkPassword){
        return res.status(400).json({errorMessage:"Wrong password please try again !"})            
    }

    const token = jwt.sign(
        {
        user:checkUser._id
        },
        process.env.JWT_SECRET
    )

    return res.cookie("token", token, {
        httpOnly:true
    }).send("yes please");
    
    // res.cookie("token","", {
    //     httpOnly:true,
    //     expires: new Date(0)
    // }).send();

        
    } catch(err){
        console.log(err);
        return res.status(500).send("nono");        
    }
})

router.get("/loggedIn", async(req,res)=>{
    
    try {
        const token = req.cookies.token;

        if(!token){
            return res.json(false)   
        }
        
        const verifiedToken = jwt.verify(token, process.env.JWT_SECRET);
        console.log("verifiedToken",verifiedToken);
        
        return res.send(true);

    } catch(err){
    console.log("authError",err);
    return res.json(err)
    }
})


router.get("/logout",(req,res)=>{
    return res.cookie("token","", {
        httpOnly:true,
        expires: new Date(0)
    }).send();

})


module.exports = router;