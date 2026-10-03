const express=require("express");
const wrapAsync=require("../utils/error");
const router=express.Router();
const passport=require("passport");
const {saveredirecturl}=require("../mw");

const userController=require("../controllers/user");    

router.get("/",userController.rendersignupform);

router.post("/signup",wrapAsync(userController.signup));

router.route("/login")
.get(userController.renderloginform)
.post(saveredirecturl,passport.authenticate("local",{failureRedirect:"/login",failureFlash:true}),userController.login);

router.get("/logout",userController.logout);

module.exports=router;