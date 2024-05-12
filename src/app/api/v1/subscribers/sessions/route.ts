import {NextResponse} from "next/server";
import {getSubscriber} from "@/lib/dbconnection";
import {createJWT} from "@/lib/apptoken";

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
                        const token = createJWT(result._id, result.name, result.email, result.authdetails.account_type);
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