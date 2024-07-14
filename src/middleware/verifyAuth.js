require("dotenv").config()
const jwt = require("jsonwebtoken")

let jwtSecret = process.env.JWT_SECRET;
export const verifyAuth = (request, response, next)=>{
    try{
        const authorization = request.headers.authorization;

        let token = authorization.replace("Bearer ", "");
        if(token){
            let payload = jwt.verify(token, jwtSecret)

            if(!payload){
                return response.status(400).json({message: "User not Authorized"});
            }
            request.body.user = payload.id;
            next()
            return null;
        }
        else{
            return response.status(400).json({message: "User not Authorized"});
        }
    }
    catch(err){
        return response.status(400).json({message: err.message});
    }
}