import {NextResponse} from "next/server";
import {
    addRolesSubscriber,
    addSubscriber, changeSubscriberPasswd,
    deleteRolesSubscriber,
    getSubscriber,
    getSubscribers
} from "@/lib/dbconnection";
import { verifyToken} from "@/lib/apptoken";

export async function GET(request: Request): Promise<NextResponse> {
    try {
        return await new Promise((resolve, reject) => {
            getSubscribers(0, 50).then(subscribers => {
                if (subscribers) {
                    resolve(NextResponse.json({...subscribers}, {status: 200}));
                }else{
                    console.error("This shouldn't happen");
                    reject(NextResponse.json({ error: 'failed to fetch data' }, { status: 500 }));
                }
            }).catch(error => {
                reject( NextResponse.json({ error: error }, { status: 500 }));
            });
        });
    } catch (err) {
        console.error("Error getting list of subscribers", err);
        return NextResponse.json({ error: 'failed to fetch data' }, { status: 500 });
    }
}

export async function POST(request: Request): Promise<NextResponse> {
    try {
        const results: NextResponse = await new Promise( ( resolve, reject ) => {
                request.json().then( (data: any) => {
                    addSubscriber(data).then( (rtnResult:any) => {
                        if(rtnResult === 'undefined' || !rtnResult) {
                            console.error("rtnResult should not be undefined");
                            reject( NextResponse.json({ error: 'Unknown error' }, { status: 500 }));
                        }else {
                            resolve( NextResponse.json({"message": "Hello World!", "user": rtnResult}, {status: 200}));
                        }
                    }).catch((error) => {
                        console.error("POST: error while adding user: ", error);
                        if (error.errorResponse) {
                            switch (error.errorResponse.code) {
                                case 11000:
                                    //When email already exists
                                    resolve(NextResponse.json({error: ' Subscriber already exists'}, {status: 409}));
                                    break;
                                case 121:
                                    // schema validation failed
                                    resolve(NextResponse.json({error: 'Validation failed'}, {status: 400}));
                                    break;
                                default:
                                    reject(NextResponse.json({error: ' Error occurred while creating user'}, {status: 500}));
                            }
                        } else {
                            reject(NextResponse.json({error: '2. Error occurred while creating user'}, {status: 500}));
                        }
                    });
                });
            }
        );
        return results;
    } catch (err) {
        console.error("POST: error while creating user: ", err);
        return NextResponse.json({ error: 'failed to create user' }, { status: 500 });
    }
}

export async function PATCH(request: Request): Promise<NextResponse> {
    try{
        const authorization  = request.headers.get('authorization');
        if (!authorization) {
            return NextResponse.json({ message: 'Unauthorised' }, { status: 401 });
        }
        const token = authorization.split(" ")[1];
        const jwtDecodedToken: any = verifyToken(token);
        if(jwtDecodedToken){
            return await new Promise((resolve, reject) => {
                request.json().then(bodyData => {
                    const {command, data} = bodyData;
                    const email = jwtDecodedToken.email;
                    switch(command) {
                        case 'ChangePassword':
                            const {oldPassword, newPassword} = data;
                            changeSubscriberPasswd(email, newPassword, oldPassword).then(rtnResult => {
                                if( rtnResult === 'undefined' || !rtnResult) {
                                    console.error("Error: This shouldn't happen ");
                                    reject(NextResponse.json({ error: 'failed to verify password' }, { status: 500 }));
                                }else{
                                    if(rtnResult.modifiedCount == 0) {
                                        console.error("Error: old password verification failed");
                                        resolve(NextResponse.json({ error: 'Change password failed' }, { status: 400 }));
                                    }else if(rtnResult.modifiedCount == 1) {
                                        resolve(NextResponse.json({ message: "Password changed" }, { status: 200 }));
                                    }else {
                                        resolve(NextResponse.json({ message: rtnResult.modifiedCount+" accounts password changed" }, { status: 200 }));
                                    }
                                }
                                }).catch(error => reject(error));
                            break;
                        case 'AddRoles':
                        {
                            const {subscriber_email, roles} = data;
                            addRolesSubscriber(subscriber_email, roles).then(rtnResult => {
                                if( rtnResult === 'undefined' || !rtnResult) {
                                    console.error("Error: This shouldn't happen ");
                                    reject(Error("Error: This shouldn't happen "));
                                }else{
                                    if(rtnResult.modifiedCount == 1){
                                        resolve(NextResponse.json({ message: 'Roles updated', result: rtnResult }, { status: 200 }));
                                    }else if(rtnResult.modifiedCount == 0){
                                        resolve(NextResponse.json({ message: 'Failed to update the subscriber', result: rtnResult }, { status: 400 }));
                                    }else{
                                        resolve(NextResponse.json({ message: rtnResult.modifiedCount+' subscribers updated', result: rtnResult }, { status: 200 }));
                                    }
                                }
                            }).catch(error => reject(error));
                            resolve(NextResponse.json({ message: 'user updated' }, { status: 200 }));
                            break;
                        }
                        case 'DeleteRoles':
                        {
                            const {subscriber_email, roles} = data;
                            deleteRolesSubscriber(subscriber_email, roles).then(rtnResult => {
                                if( rtnResult === 'undefined' || !rtnResult) {
                                    console.error("Error: This shouldn't happen ");
                                    reject(Error("Error: This shouldn't happen "));
                                }else{
                                    if(rtnResult.modifiedCount == 1){
                                        resolve(NextResponse.json({ message: 'Roles updated', result: rtnResult }, { status: 200 }));
                                    }else if(rtnResult.modifiedCount == 0){
                                        resolve(NextResponse.json({ message: 'Failed to update the subscriber', result: rtnResult }, { status: 400 }));
                                    }else{
                                        resolve(NextResponse.json({ message: rtnResult.modifiedCount+' subscribers updated', result: rtnResult }, { status: 200 }));
                                    }
                                }
                            }).catch(error => reject(error));
                            resolve(NextResponse.json({ message: 'user updated' }, { status: 200 }));
                            break;
                        }

                    }
                }).catch(error =>{
                    reject(error);
                });
            });
        }else{
            return NextResponse.json({ message: 'Unauthorised' }, { status: 401 });
        }

    }catch(error) {
        console.error("PATCH: error while updating user: ", error);
        return NextResponse.json({ error: 'failed to update user' }, { status: 500 });
    }
}