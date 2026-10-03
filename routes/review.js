const express=require("express");
const router=express.Router({mergeParams:true});
const wrapAsync=require("../utils/error");
const {logged,isReviewAuthor,validateReview}=require("../mw");

const reviewController=require("../controllers/review");

router.post("/",logged,validateReview,wrapAsync(reviewController.addreview));

router.delete("/:reviewid",logged,isReviewAuthor,wrapAsync(reviewController.destroyreview));

module.exports=router;