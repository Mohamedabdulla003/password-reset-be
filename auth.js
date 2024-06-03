import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";

const hashpassword =async(password)=>{
    const salt =await bcrypt.genSaltSync(Number(process.env.SALT_ROUNDS));
    let hash = await bcrypt.hash(password,salt)
    return hash
}

const hashcompare = async(password,hash)=>{
    return await bcrypt.compare(password,hash)
}

const createToken = async (payload) => {
    const token = await jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });
    return token;
  };
  
  const decodeToken = async (token) => {
    const payload = await jwt.decode(token);
    return payload;
  };

export default{
    hashpassword,
    hashcompare,
    createToken,
    decodeToken,
}