import  userModel from '../models/user.js';
import auth  from '../common/auth.js';
import  nodemailer from 'nodemailer';
import dotenv from "dotenv";

dotenv.config();

const getallUsers = async (req, res) => {
  try {
    const user = await UserModel.find({},{password:0});
    res.status(200).send({
      message: "User Data Fetched Successfully",
      user,
    });
  } catch (error) {
    res.status(500).send({
      message: "Internal Server Error",
    });
  }
};


const signupController = async (req,res)=>{
   try {
    const{ firstName,lastName,email,password } =req.body;

    if(!firstName || !lastName || !email || !password) {
         return res.status(400).json({message: "All fields are required" });
    } 

    const existingUser =await userModel.findone({ email });
    if(existingUser) {
        return res.status(400).json({message: "Email is already registerd" });
    } 

    const hashpassword = await auth.hashpassword(password);
    const newUser =new userModel({
        firstName,
        lastName,
        email,
        password:hashpassword,
    })
    
    await newUser.save();
    let userData = await UserModel.findOne(
      {email:req.body.email},
      {_id:0,email:0,password:0,status:0,createdAt:0}
    )
     res.status(201).json({
      message:"User created successfully",userData
    })
    }catch (error) {
     console.error(error);
     res.status(500).json({ message: "Intervel server error",error:error.message });
   }
};

const login =async (req,res) =>{
    try {
        const {email,password} =req.body;
        const user =await userModel.findone({ email });
        if(!user) {
            return res.status(404).json({ message: "User not found "});
        }
        const isPasswordValid = await auth.hashCompare(password, user.password);
        if (!isPasswordValid) {
          return res.status(401).json({ message: "Invalid password" });
        }
        const token = await auth.createToken({
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            createdAt:user.createdAt
          },'10');
          let userData = await userModel.findOne(
            { email: req.body.email },
            { _id: 0, password: 0, status: 0, createdAt: 0, email: 0 }
          );
          res.status(200).json({ message: "Login successfully", token, userData });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error",error:error.message, });
    }
}

const forgetpassword = async(req,res) =>{
  const { email } =req.body;

  try {
    let user =await userModel.findOne({ email });
    if(!user){
      return res.status(404).json({ message:"User not found"})
    }

    const generateOTP =() => {
      const cheracters = "0123456789";
      return Array.from(
        { length: 6 },
        () => characters[Math.floor(Math.random() * characters.length)]
      ).join("");
    };

    const OTP =  generateOTP();
    user.resetPasswordOtp = OTP;
    user.resetPasswordExpiress = date.now() + 360000;
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.USER_MAILER,
        pass: process.env.PASS_MAILER,
      },
    });

    const mailOptions = {
      from: "abdullmohanerrs@gmail.com",
      to: user.email,
      subject: "Password Reset",
      html: `
      <div>
        <p>Dear ${user.firstName} ${user.lastName},</p>
        <p>We received a request to reset your password. Here is your One-Time Password (OTP): <strong>${OTP}</strong></p>
        --<br>
        <p>Thank you,</p>
        <p>From Validation</p>
      </div>  
      `
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Password reset email sent successfully" });

  } catch (error) {
    res.status(500).json({
      message:"Internal Server Error",
      error:error.message,
    });
  }
};

const resetPassWord = async (req,res)=>{
  try {
    const {OTP, password} = req.body;

    const user = await userModel.findOne({
      resetPasswordOtp: OTP,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      const message = user ? "OTP has expired" : "Invalid OTP";
      return res.status(404).json({ message });
    }

    const hashedPassword = await auth.hashPassword(password);
    user.password = hashedPassword;
    user.resetPasswordOtp = null;
    user.resetPasswordExpires = null;

    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message:"Internal Server Error" })
  }
};

export default {
   signupController,
   login,
   forgetpassword,
   resetPassWord,
}