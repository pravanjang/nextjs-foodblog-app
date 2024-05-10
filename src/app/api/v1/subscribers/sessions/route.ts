import {NextResponse} from "next/server";
import {getSubscriber} from "@/lib/dbconnection";
import jwt from "jsonwebtoken";


const jws_secret =  process.env.JWT_SECRET || "test_secret" ;

export async function POST(request: Request): Promise<any> {
    try{
        const {email, password} = await request.json();
        return await new Promise( ( resolve, reject ) => {
           getSubscriber(email, password).then(rtnResult => {
                if( rtnResult === 'undefined' || !rtnResult) {
                    console.error("Error: This shouldn't happen ");
                    reject(NextResponse.json({ status: 'failed', error: 'failed to login' }, { status: 500 }));
                }else{
                    if(rtnResult.status === "failed") {
                        console.error("Error: Failed to login");
                        resolve(NextResponse.json({ status: 'failed', error: 'failed to login' }, { status: 401 }));
                    }else{
                        const result = rtnResult.subscriber;
                        const token = jwt.sign({
                            name: result.name,
                            email: result.email,
                            account: result.authdetails.account_type
                        }, jws_secret, {expiresIn: '7d'});
                        resolve(NextResponse.json({ status: 'success', token: token }, { status: 201 }));
                    }
                }
           }).catch(error => {
               console.error("Error: ", error);
               reject(NextResponse.json({ status: 'failed', error: 'failed to login' }, { status: 500 }));
           })
        });

    }catch(e){
        return NextResponse.json({ status: 'failed', error: 'failed to login' }, { status: 500 });
    }
}