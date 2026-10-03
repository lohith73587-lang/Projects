if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
}

const express=require("express");
const app=express();
const mongoose=require("mongoose");
const Listing=require("./models/listing");
const path=require("path");
const methodOveride=require("method-override");
const ejsMate=require("ejs-mate");
const wrapAsync=require("./utils/error");
const ExpressError=require("./utils/ExpressError");
const {listingSchema,reviewSchema}=require("./Schema");
const Review=require("./models/reviews");

const listingsR=require("./routes/listing"); 
const reviewsR=require("./routes/review");
const userR=require("./routes/user");

const session=require("express-session");
const {MongoStore}=require("connect-mongo");        
const flash=require("connect-flash");
const User=require("./models/user");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const dns=require("dns");
dns.setServers(["8.8.8.8","1.1.1.1"]);


app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOveride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

const dbUrl=process.env.MONGO_URL;

const clientPromise=mongoose.connect(dbUrl,{
    family:4,
})
.then(()=>{
    console.log("MongoDB connected");
    return mongoose.connection.getClient();
})
.catch(err=>{
    console.log("MongoDB connection error:",err);
    throw err;
});

const store=MongoStore.create({
    clientPromise:clientPromise,
    dbName:"TravelCo",
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter:24*3600,
});

store.on("error",(err)=>{
    console.log("ERROR IN MONGO STORE",err);
});

const sessionOptions={
    store:store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now() +1000*60*60*24*3,
        maxAge:1000*60*60*24*3,
        httpOnly:true
    } 
};

mongoose.connect(process.env.MONGO_URL,{
    family:4,
    
})
.then(()=>{
    console.log("MongoDB connected");
})
.catch(err=>{
    console.log("MongoDB connection error:",err);
});

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    app.locals.success=req.flash("success");
    app.locals.error=req.flash("error");
    app.locals.curruser=req.user;
    next();
});

app.use("/listings",listingsR);
app.use("/listings/:id/review",reviewsR);
app.use("/",userR);

// app.get("/registeruser", async (req,res)=>{
//     let User1= new User({
//         email:"lohith735@gmail.com",
//         username:"WEB DEV"
//     });
//     await User.register(User1,'PASS123'); User.register(); is used to assign pass to newly created user
//     res.send(User1);
// }); 


app.all("/{*splat}",(req,res,next)=>{
    next(new ExpressError(404,"Page not found"));
});


app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong" } = err;
     res.status(statusCode).render("error.ejs", { statusCode,err });
});

app.listen(8080,(req,res)=>{
    console.log("connected to port");
});