const mongoose=require("mongoose");
const initialDATA=require("./data");
const listing=require("../models/listing");

main().then(()=>{
    console.log('connected');
}).catch((err)=>{
    console.log(err);
});
async function main(){
    await mongoose.connect('mongodb://127.0.0.1:27017/TravelCo');

}

const initDB=async ()=>{
    await listing.deleteMany({});
    initialDATA.data=initialDATA.data.map((obj)=>({...obj,owner:"6abf26046da53feed791a45d"}));
    await listing.insertMany(initialDATA.data);
    console.log("DB ready");
};

initDB();
