const router = require("express").Router();
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.post("/", async(req,res)=>{
    
   try 
    {
    console.log("request data",req.body)
    
    let {email, password, verifyPassword} = req.body;
    console.log("reqBody",req.body)

    if(!email || !password || !verifyPassword){
        return res.status(400).json({errorMessage:"Please fill complete fields !"})    
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

    //hashing the password

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
        email:email,
        hashedPassword:passwordHash
    })

        req.session.email=email;
        req.session.password=password;


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

    
  
    res.cookie("token", token, {
        httpOnly:true
    }).send();

    
    } catch(err){
    console.error(err);
    res.status(500).send();
  }
})



router.post("/login", async(req, res)=>{
    
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

          res.status(400).json({errorMessage:"Email is not registered !"})            
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


        
    } catch(err){
        console.log(err);
        res.status(500).send("nono");        
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
        
        res.send(true);

    } catch(err){
    console.log("authError",err);
    res.json(false)
    }
})


router.get("/logout",(req,res)=>{
    res.cookie("token","", {
        httpOnly:true,
        expires: new Date(0)
    }).send();

})


module.exports = router;