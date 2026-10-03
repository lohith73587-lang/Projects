const User=require("../models/user");

module.exports.rendersignupform=(req,res)=>{
    res.render("users/signup.ejs");
}

module.exports.signup=async(req,res,next)=>{
    try{
        let {Username,Email,Password}=req.body;
        const newuser=new User({username:Username,email:Email});
        const regUser=await User.register(newuser,Password);
        console.log(regUser);

        req.login(regUser,(err)=>{
            if(err){
                return next(err);
            }

            req.flash("success",`Welcome to TravelCo ,${Username}`);
            res.redirect("/listings");
        });

    }catch(err){
        req.flash("error",err.message);
        res.redirect("/");
    }
}

module.exports.renderloginform=(req,res)=>{
    res.render("users/login.ejs");
}

module.exports.login=(req,res)=>{
    req.flash("success",`Welcome ${req.body.username}`);
    let redirecturl=res.locals.redirectUrl || "/listings";
    delete req.session.redirectUrl;
    res.redirect(redirecturl);
}

module.exports.logout=(req,res,next)=>{
    req.logOut((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","LOGGED OUT");
        res.redirect("/listings");
    });
}