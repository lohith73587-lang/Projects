const Review = require("./models/reviews");
const ExpressError = require("./utils/ExpressError");
const { listingSchema, reviewSchema } = require("./Schema");

const logged = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "Login");
        return res.redirect("/login");
    }
    next();
};

const saveredirecturl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }

    next();
};

const isReviewAuthor = async (req, res, next) => {

    let { id, reviewid } = req.params;

    let review = await Review.findById(reviewid);

    if (!review) {
        req.flash("error", "Review not found");
        return res.redirect(`/listings/${id}`);
    }

    if (!review.author.equals(req.user._id)) {
        req.flash("error", "You are not the author of this review");
        return res.redirect(`/listings/${id}`);
    }

    next();
};

const validateListing=(req,res,next)=>{     
    let {error}=listingSchema.validate(req.body);
         if(error){         
            throw new ExpressError(400,error.message);
    }else{
        next();     
    } };


const validateReview=(req,res,next)=>{
    let {error}=reviewSchema.validate(req.body);
    if(error){
        throw new ExpressError(400,error.message);
    }else{
        next();
    }
};

module.exports = {
    logged,
    saveredirecturl,
    isReviewAuthor,
    validateListing,
    validateReview
};