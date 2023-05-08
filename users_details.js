const mongoose=require('mongoose')
const validator = require('validator')


const userDetailsSchema= new mongoose.Schema({
    name:{
        type:String,
        required:true},
   
    email:{
        type:String,
        required:true,
        lowercase:true,
        validate:(value)=>{
            return validator.isEmail(value)
        }
    },
    mobile:{
        type:String,
        required:false
    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        required:true
    }
},{
    collection:"user-info",
    versionKey:false
}
)

const user=mongoose.model("user-info",userDetailsSchema)
module.exports= {user}