import { validationResult, body } from "express-validator";

const validate =(route) =>{
    switch (route){
        case "signup":
            return[
                body("firstname").notempty().withMessage("First Name is requried"),
                body("lastname").notempty().withMessage("Last Name is requried"),
                body("email").notempty().withMessage("invalid email address"),
                body("passsword")
                .matches(/^(?=.*[a-zA-Z])(?=.*\d).{8,}$/)
                .withMessage(
                  "Password must contain at least one digit, one lowercase and one uppercase letter, and one special character (@#$%^&+=)"
                ),
            ];
        case "signin":
            return[
                body("email").isEmail().withMessage("Invaild Email address"),
                body("password").isEmail().withMessage("Password s requried"),
            ];
        case "forgetPassword":
            return[ body("email").isEmail().withMessage("Invaild Email address"),];
        case "restpassword":
            return [
                body("OTP").notEmpty().withMessage("OTP is required"),
                body("password")
                  .isLength({ min: 8 })
                  .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=]).{12,}$/)
                  .withMessage(
                    "Password must be at least 12 characters long and contain at least one digit, one lowercase and one uppercase letter, and one special character (@#$%^&+=)"
                  ),
            ];    
        default:
            return [];
    }
};


const validationMiddleware = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  };
  
  export default { validate, validationMiddleware };