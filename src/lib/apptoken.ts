import jwt from "jsonwebtoken";


const jws_secret =  process.env.JWT_SECRET || "test_secret" ;

export function createJWT(id: string, name: string, email: string, account_type: []): any {
    try{
        const token = jwt.sign({
            id: id,
            name: name,
            email: email,
            account: account_type
        }, jws_secret, {expiresIn: '30d'});

        return token;
    }catch (err){
        console.error("Error: ", err);
        throw err;
    }

}

export function verifyToken(token: string) {
    try {
        const decoded = jwt.verify(token, jws_secret);
        return decoded;
    } catch (error) {
        return null;
    }
}
