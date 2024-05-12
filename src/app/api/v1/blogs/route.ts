import {NextResponse} from "next/server";

export async function POST(request: Request) {

    try {
        return NextResponse.json({ "message": "Hello World!"},  { status: 200 });
    } catch (err) {
        return NextResponse.json({ error: 'failed to fetch data' }, { status: 500 });
    }

}