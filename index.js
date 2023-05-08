const express =require('express');
const mongoose = require('mongoose');
const cors= require('cors');
const app = express()
const {user}= require('./users_details');
const {url}= require('./common/db_config');
const jwt = require('jsonwebtoken');
const bcrypt=require('bcryptjs');
const nodemailer = require('nodemailer')

mongoose.connect(url);

app.set("view engine","ejs");
app.use(express.urlencoded({extended:false}));


app.use(express.json());
app.use(cors());

const PORT= 5000;
const saltRounds=10;
const secretkey="sdkjfkdsnksd>dsf<dsfds/fdsfsd\dffw";

app.post("/signup", async (req,res)=>{
    const{name,email,mobile,password,role}=req.body;

    const salt= await bcrypt.genSalt(saltRounds)
    const hashedpassword= await bcrypt.hash(password,salt)
    try {
        const oldUser = await user.findOne({email});
        
        if(oldUser){
            return res.status(400).json({
                success:false,
                message:"User Already Exists"
            })
        }else{
          const userdata=  await user.create({
                name,
                email,
                password:hashedpassword,
                mobile,
                role,
            });
            res.status(200).json({
                success:true,
                message:"User Signup Sucessfully....",
                data:userdata
            })
        }
    } catch (error) {
        res.status(400).json({
            message:"Bad Request",
            error:error
        })
    }
})


app.post("/login", async(req,res)=>{

    const {email,password}= req.body;
    // try{
    const User = await user.findOne({email});
    if(!User){
        return res.status(400).json({
            success:false,
            message:"User Not Found..."
        })
    }

        if(await bcrypt.compare( password ,User.password)){
            const token = jwt.sign({email:User.email},secretkey,{expiresIn:'15m',});

        if(res.status(201)){
           return res.json({
                success:true,
                message:"User Login Successfully..!!",
                data:token
            });
        }else{
           return  res.json({
                success:false,
                message:"invalid Credantials",
            
            })
        }
    }
    res.status(400).json({
        success:false,
        message:" Invalid Password.."
        

    })

})

app.post("/userdata", async(req,res)=>{

    const {token}= req.body;
    try {
        const User= jwt.verify(token,secretkey,(err,res)=>{
            if(err){
                return "Token expired"
            }else{
                return res;
            }
        });
        console.log(User);

        if(User == "Token expired"){
            return res.status(400).json({
                success:false,
                message:"Token Expired....."
            });
        }

        const useremail = user.email;
        user.findOne({email:useremail})
        .then((data)=>{
            res.status(200).json({
                success:true,
                message:"user information here....." ,
                data:data
            });
        })
            .catch((error)=>{
                res.status(400).json({
                    success:false,
                    message:"Error user data not fetched.... "
                })
            });
        } catch(error){}
        });



app.post("/forget-password",async(req,res)=>{
    const {email}=req.body;
    try {
        const olduser=await user.findOne({email});
        if(!olduser){
            return res.status(400).json({
                message:"user not exists"
            });
        }
        const secret = secretkey+olduser.password;
        const token = jwt.sign({email:olduser.email,id:olduser._id},secret,{expiresIn:'5m'});


        const link = `http://localhost:5000/reset-password/${olduser._id}/${token}`;
 
        var transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: "karthick18696@gmail.com",
              pass: "asdf",
            },
          });
      
          var mailOptions = {
            from: "karthick18696@gmail.com",
            to: "kpk200696@gmail.com",
            subject: "Password Reset",
            text: link,
          };
      
          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log(error);
            } else {
              console.log("Email sent: " + info.response);
            }
          });

        console.log(link);
    } catch (error) {
        
    }
})


app.get("/reset-password/:id/:token",async(req,res)=>{
    const {id,token}=req.params;
    console.log(req.params);

const oldUser=await user.findOne({_id:id});
if(!oldUser){
    return res.json({ status: "User Not Exists!!" });
}

const secret =secretkey+oldUser.password;
try {
    const verify = jwt.verify(token,secret);
    res.render("index",{email:verify.email,status:"not verified"});

} catch (error) {
    console.log(error);
res.send("not verified");
}

});


app.post("/reset-password/:id/:token",async(req,res)=>{
    const {id,token}=req.params;
   const {password}=req.body;

const oldUser=await user.findOne({_id:id});
if(!oldUser){
    return res.json({ status: "User Not Exists!!" });
}

const secret =secretkey+oldUser.password;
try {
    const verify = jwt.verify(token,secret);

    const salt= await bcrypt.genSalt(saltRounds)
    const hashedpassword= await bcrypt.hash(password,salt);
    await user.updateOne(
    {
        _id: id,
      },
      {
        $set: {
          password: hashedpassword,
        },
      }
    );

    res.render("index",{email:verify.email,status:"verified"});

} catch (error) {
    console.log(error);
res.json({message:" somthing went wrong"});
}

});






app.listen(PORT,()=>{
    console.log(`app started in - ${PORT}`)
})