const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv")
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");


const session = require('express-session');
const FileStore = require('session-file-store')(session);

const photo = require("./routes/photoRouter")
const mailer = require("./routes/mailer")
const auth = require("./middleware/auth");
const httpRouter = require("./routes/httponly");

dotenv.config();
const app = express();
app.use(morgan('tiny'));


const PORT = process.env.PORT || 3002;
const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "https://reactjsauth.vercel.app"
]

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  // origin: ["http://localhost:3000", "https://pensive-clarke-d769e6.netlify.app/", "https://master--pensive-clarke-d769e6.netlify.app/"],
  origin: ['http://localhost:3000', "https://reactjsauth.vercel.app", "https://pensive-clarke-d769e6.netlify.app"],
  credentials: true
}));

app.use(function(req, res, next) {
  //  res.set("Access-Control-Allow-Origin", req.headers.origin);
  res.set("Access-Control-Allow-Credentials", true);
  res.set('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.set("Access-Control-Allow-Headers", 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json');
  next();
});

app.listen(PORT, ()=> console.log(`Server is running up at ${PORT}`));

// app.use(session({
//   name: 'session-id',
//   secret: '12345-67890-09876-54321',
//   saveUninitialized: false,
//   resave: false,
//   // cookie:{maxAge:50000, sameSite: "none"}, 
//   // cookie:{expires:50000},
//   store: new FileStore()
// }));

app.get("/", (req,res)=>{
   return res.send("Data came from server");
  //express deprecated res.send(status, body): Use res.status(status).send(body) instead
  //res.status(200).send(req.headers);
})

// / localhost:3002/
mongoose.connect(process.env.MG_DB ,  
  { useNewUrlParser: true , useUnifiedTopology: true }, (err)=>{

  if(err) return console.error(err);

  console.log("Connected to MongoDb");
});


app.use("/auth", require("./routes/userRouter"));
app.use("/photos", auth, photo);

app.use("/mail", httpRouter)
