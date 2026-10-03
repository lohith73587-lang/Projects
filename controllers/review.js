const Listing=require("../models/listing");
const Review=require("../models/reviews");

module.exports.addreview=async (req,res)=>{
    let listing=await Listing.findById(req.params.id);

    if(!listing){
        req.flash("error","The listing you are looking for is not available");
        return res.redirect("/listings");
    }

    let newreview=new Review(req.body.review);
    newreview.author=req.user._id;

    listing.reviews.push(newreview._id);

    await newreview.save();
    await listing.save();

    req.flash("success","review added");
    res.redirect(`/listings/${listing._id}`);
}

module.exports.destroyreview=async (req,res)=>{
    let {id,reviewid}=req.params;

    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewid}});
    await Review.findByIdAndDelete(reviewid);

    req.flash("success","review deleted");
    res.redirect(`/listings/${id}`);
}