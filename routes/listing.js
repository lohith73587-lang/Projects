const express=require("express");
const router=express.Router();
const Listing=require("../models/listing");
const wrapAsync=require("../utils/error");
const ExpressError=require("../utils/ExpressError");
const {listingSchema}=require("../Schema");
const {logged}=require("../mw");
const {validateListing}=require("../mw");
const multer=require("multer");
const {storage}=require("../cloudConfig");
const upload=multer({storage});

const   listingController=require("../controllers/listing");

router.route("/")
.get(wrapAsync(listingController.index))
.post(logged,upload.single("listing[image][url]"),validateListing,wrapAsync(listingController.addnewlisting));

router.get("/new",logged,wrapAsync(listingController.rendernewform));

router.get("/:id",wrapAsync(listingController.showlisting));

router.get("/:id/edit",logged,listingController.editlisting);

router.put("/edit/:id",logged,upload.single("listing[image][url]"),wrapAsync(listingController.updatelisting));

router.delete("/delete/:id",logged,listingController.destorylisting);

module.exports=router;