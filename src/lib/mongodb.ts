import {MongoClient, ObjectId } from 'mongodb';
import {Simulate} from "react-dom/test-utils";
import error = Simulate.error;

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const options = {};
const dbName = "foodblogdb";

const subscriberCOll = "subscribers";
const blogsCollection = "blogs";

if(!uri){
    throw new Error("$MONGODB_URI is missing");
}

const client = new MongoClient(uri, options);

type Subscriber = {
    id ?: string,
    name: string,
    mailid: string,
    password ?: string,
    creationdate: Date,
    modifieddate: Date
}

type Blogs = {
    blogname: string,
    title: string,
    bloggerId: string,
    bloggerName: string,
    content: string,
}
/**********************************************************************************************************
 *       Functions to insert, update, delete, find operation on  subscriberCOll collection
 * ********************************************************************************************************/

/*
* This function inserts document to the collection
*
* @function
* @async
* @param {Subscriber} Subscriber - Object containing details of the subscriber
* @return {Promise<Subscriber>} A promise which resolves to Subscriber object containing new "id"
*                               and rejects with error message in case of failure.
 */
export async function addSubscriber(subscriber: Subscriber): Promise<any> {
    client.connect()
        .then( async connectedClient => {
            const db = connectedClient.db(dbName);
            const {acknowledged, insertedId} = await db.collection(subscriberCOll).insertOne(subscriber);
            await client.close();
            if(acknowledged){
                return Promise.resolve({status:"success", subscriber: {id: insertedId.toString() , ...subscriber} });
            }else{
                return Promise.reject({status: "error", error: "Insert Error", logmessage: "Failed to insert document into database"});
            }

        })
        .catch(error => {
            return Promise.reject({status: "error", error: error, logmessage: "Failed to connect database"});
        });
}

/*
* This function deletes document on the collection
*
* @function
* @async
* @param {number}  subscriber unique id
* @return {Promise<number>} A promise which resolves to number of document deleted
*                               and rejects with error message in case of failure.
 */
export async function  deleteSubscriber(subscriberid:string): Promise<any> {
    client.connect()
    .then( async connectedClient => {
        const db = connectedClient.db(dbName);
        const query = { _id: new ObjectId(subscriberid) };
        const {acknowledged, deletedCount} = await db.collection(subscriberCOll).deleteOne(query);
        if(acknowledged && deletedCount){
            return Promise.resolve({status:"success", deletedCount: deletedCount});
        }else{
            return Promise.reject({status: "error", error: "Deletion Error", logmessage: "Failed to delete subscription"});
        }
    }).catch(error => {
        return Promise.reject({status: "error", error: error, logmessage: "Failed to connect database"});
    });
}

/*
* This function updates document of the collection
*
* @function
* @async
* @param {Subscriber} Subscriber - Object containing details of the subscriber
* @return {Promise<number>} A promise which resolves to number of document updated
*                               and rejects with error message in case of failure.
 */
export async function modifySubscriber( subscriber: Subscriber): Promise<any> {
    client.connect()
        .then( async connectedClient => {
            const db = connectedClient.db(dbName);
            const query = { _id: new ObjectId(subscriber.id) };
            const {acknowledged, modifiedCount} = await db.collection(subscriberCOll).updateOne(query, {$set: subscriber} );
            if(acknowledged && modifiedCount){
                return Promise.resolve({status:"success", modifiedCount: modifiedCount});
            }else{
                return Promise.reject({status: "error", error: "Updation Error", logmessage: "Failed to update subscription"});
            }
        }).catch(error => {
        return Promise.reject({status: "error", error: error, logmessage: "Failed to connect database"});
    });
}

/*
* This function retrieves document from the collection
*
* @function
* @async
* @param {string} id - id of the subscriber
* @param {string} passwd - optional password string
* @return {Promise<Subscriber>} A promise which resolves to Subscriber object
*                               and rejects with error message in case of failure.
 */
export async function getSubscriber( id: string, passwd ?: string): Promise<any> {
    client.connect()
        .then( async connectedClient => {
            const db = connectedClient.db(dbName);
            let query ;
            if(passwd !== undefined && passwd !== null){
                query = { _id: new ObjectId(id), password: passwd };
            }else {
                query = { _id: new ObjectId(id) };
            }
            const subscriber = await db.collection(subscriberCOll).findOne(query, {projection: {password: 0}});
            if(subscriber){
                return Promise.resolve({status:"success", subscriber: subscriber});
            }else{
                return Promise.reject({status: "error", error: "Updation Error", logmessage: "Couldn't found subscriber"});
            }
        }).catch(error => {
        return Promise.reject({status: "error", error: error, logmessage: "Failed to connect database"});
    });
}

/**********************************************************************************************************
 *           Functions to insert, update, delete, find operation on  blogsCollection collection
 * ********************************************************************************************************/