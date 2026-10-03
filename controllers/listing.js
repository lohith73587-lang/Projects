const Listing=require("../models/listing");
const ExpressError = require("../utils/ExpressError");
const mbxGeocoding=require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken=process.env.MAP_TOKEN;
const geocodingClient=mbxGeocoding({accessToken:mapToken});

module.exports.index=async (req,res)=>{
    let lists= await Listing.find({});
    res.render("listing/index.ejs",{lists});
}

module.exports.rendernewform=async(req,res)=>{
    res.render('listing/new.ejs');
}

module.exports.showlisting=async (req,res)=>{
    let { id }=req.params;
    const li=await Listing.findById(id).populate({path:"reviews",populate:{path:"author"}}).populate("owner");
    if(!li){
        req.flash("error","The listing you are looking for is not available");
         return res.redirect("/listings");
    }
    res.render("listing/show.ejs",{li});
}

module.exports.editlisting=async (req,res)=>{
    let {id}=req.params;
    const li=await Listing.findById(id);
    if(!li){
        req.flash("error","The listing you are looking for is not available");
         return res.redirect("/listings");
    }
    let OGimageurl=li.image.url;
    OGimageurl=OGimageurl.replace("/upload","/upload/w_250");
    res.render("listing/edit.ejs",{li,OGimageurl});
}

module.exports.updatelisting=async (req,res)=>{
    let {id}=req.params;
    let Uli=req.body.listing;
    let editlisting=await Listing.findById(id);
    if(!editlisting){
        req.flash("error","The listing you are looking for is not available");
        return res.redirect("/listings");
    }
    let curruser=req.user;
    if(!editlisting.owner._id.equals(curruser._id)){
        req.flash("error","You do not have access to edit the listing");
        return res.redirect(`/listings/${id}`);
    }
    editlisting.set(Uli);
    if(req.file){
        let url=req.file.path;
        let filename=req.file.filename;
        editlisting.image={url,filename};
    }
    await editlisting.save();
    req.flash("success","listing updated");
    res.redirect(`/listings/${id}`);
}

module.exports.addnewlisting=async (req,res,next)=>{ 
    let response=await geocodingClient
    .forwardGeocode({
        query:req.body.listing.location,
        limit:1
    })
    .send();

    if(!response.body.features.length){
        throw new ExpressError(400,"Location not found");
    }

    let url=req.file.path;
    let filename=req.file.filename;
    let newList=req.body.listing;

    if(!newList){
        throw new ExpressError(400,"send valid DATA for listing ");
    }

    const newListing=new Listing(newList);
    newListing.owner=req.user._id;
    newListing.image={url,filename};
    newListing.geometry=response.body.features[0].geometry;

    await newListing.save();

    req.flash("success","new listing added");
    res.redirect("/listings");
}

module.exports.destorylisting=async (req,res)=>{
    let {id}=req.params;
    let editlisting= await Listing.findById(id);
    let curruser = req.user;
    if(!editlisting.owner._id.equals(curruser._id)){
        req.flash("error","You do not have access to edit the listing");
        return res.redirect(`/listings/${id}`);
    }
    await Listing.findByIdAndDelete(id);
    req.flash("success"," listing deleted succesfully");
    res.redirect("/listings");
}

