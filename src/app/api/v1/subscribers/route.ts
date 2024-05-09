import {NextResponse} from "next/server";
import {addSubscriber} from "@/lib/dbconnection";

export async function GET(request: Request) {

    try {
        return NextResponse.json({ "message": "Hello World!"},  { status: 200 });
    } catch (err) {
        return NextResponse.json({ error: 'failed to fetch data' }, { status: 500 });
    }
}

export async function POST(request: Request) {
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