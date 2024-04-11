import {MongoClient, ObjectId } from 'mongodb';
import {Simulate} from "react-dom/test-utils";
import error = Simulate.error;

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const options = {};
const dbName = "foodblogdb";

if(!uri){
    throw new Error("$MONGODB_URI is missing");
}

const client = new MongoClient(uri, options);

type Subscriber = {
    name: string,
    mailid: string,
    pwdstring: string,
    creationdate: Date,
    modifieddate: Date
}

export async function addSubscriber(subscriber: Subscriber){
    client.connect()
        .then( async connectedClient => {
            const db = connectedClient.db(dbName);
            const {acknowledged, insertedId} = await db.collection("subscriptions").insertOne(subscriber);
            await client.close();
            if(acknowledged){
                return Promise.resolve({status:"success", insertedId: insertedId , ...subscriber});
            }else{
                return Promise.reject({status: "error", error: "Insert Error", logmessage: "Failed to insert document into database"});
            }

        })
        .catch(error => {
            return Promise.reject({status: "error", error: error, logmessage: "Failed to connect database"});
        });
}

export async function  deleteSubscriber(subscriberid:ObjectId){
    client.connect()
    .then( async connectedClient => {
        const db = connectedClient.db(dbName);
        const query = { _id: new ObjectId(subscriberid) };
        const {acknowledged, deletedCount} = await db.collection("subscriptions").deleteOne(query);
        if(acknowledged && deletedCount){
            return Promise.resolve({status:"success", deletedCount: deletedCount});
        }else{
            return Promise.reject({status: "error", error: "Deletion Error", logmessage: "Failed to delete subscription"});
        }
    }).catch(error => {
        return Promise.reject({status: "error", error: error, logmessage: "Failed to connect database"});
    });
}

export async function modifySubscriber(subscriberid: string, subscriber: Subscriber){
    client.connect()
        .then( async connectedClient => {
            const db = connectedClient.db(dbName);
            const query = { _id: new ObjectId(subscriberid) };
            const {acknowledged, modifiedCount} = await db.collection("subscriptions").updateOne(query, {$set: subscriber} );
            if(acknowledged && modifiedCount){
                return Promise.resolve({status:"success", modifiedCount: modifiedCount});
            }else{
                return Promise.reject({status: "error", error: "Updation Error", logmessage: "Failed to update subscription"});
            }
        }).catch(error => {
        return Promise.reject({status: "error", error: error, logmessage: "Failed to connect database"});
    });
}