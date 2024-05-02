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

type Blog = {
    id ?: string
    blogname: string,
    title: string,
    description: string,
    image_url: string,
    bloggerId: string,
    bloggerName: string,
    content?: string,
    ratings: number
    createdDate: Date,
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

/*
* This function inserts document to the collection
*
* @function
* @async
* @param {Blog} blog - Object containing details of the blog
* @return {Promise<Blog>} A promise which resolves to Subscriber object containing new "id"
*                               and rejects with error message in case of failure.
 */
export async function addBlog(blog: Blog): Promise<any> {
    client.connect()
        .then( async connectedClient => {
            const db = connectedClient.db(dbName);
            const {acknowledged, insertedId} = await db.collection(blogsCollection).insertOne(blog);
            await client.close();
            if(acknowledged){
                return Promise.resolve({status:"success", subscriber: {id: insertedId.toString() , ...blog} });
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
* @param {string}  blog's unique id
* @return {Promise<number>} A promise which resolves to number of document deleted
*                               and rejects with error message in case of failure.
 */
export async function  deleteBlog(blogid:string): Promise<any> {
    client.connect()
        .then( async connectedClient => {
            const db = connectedClient.db(dbName);
            const query = { _id: new ObjectId(blogid) };
            const {acknowledged, deletedCount} = await db.collection(blogsCollection).deleteOne(query);
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
* @param {Blog} blog - Object containing details of the subscriber
* @return {Promise<number>} A promise which resolves to number of document updated
*                               and rejects with error message in case of failure.
 */
export async function modifyBlog( blog: Blog): Promise<any> {
    client.connect()
        .then( async connectedClient => {
            const db = connectedClient.db(dbName);
            const query = { _id: new ObjectId(blog.id) };
            const {acknowledged, modifiedCount} = await db.collection(subscriberCOll).updateOne(query, {$set: blog} );
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
* @param {string} id - id of the Blog
* @return {Promise<Blog>} A promise which resolves to Blog object
*                         and rejects with error message in case of failure.
 */
export async function getBlog( id: string): Promise<any> {
    client.connect()
        .then( async connectedClient => {
            const db = connectedClient.db(dbName);
            const query = { _id: new ObjectId(id) };
            const blog = await db.collection(subscriberCOll).findOne(query);
            if(blog){
                return Promise.resolve({status:"success", blog: blog});
            }else{
                return Promise.reject({status: "error", error: "Updation Error", logmessage: "Couldn't found subscriber"});
            }
        }).catch(error => {
        return Promise.reject({status: "error", error: error, logmessage: "Failed to connect database"});
    });
}

/*
* This function retrieves documents from the collection
*
* @function
* @async
* @param {number} skip - how many number of documents from the beginning must be ignored.
* @param {number} limit - maximum number of documents should be returned
* @return {Promise<Blog>} A promise which resolves to Blog objects
*                         and rejects with error message in case of failure.
 */
export async function getBlogs(  skip: number, limit: number): Promise<any> {
    client.connect()
        .then( async connectedClient => {
            const db = connectedClient.db(dbName);
            const blogs = await db.collection(subscriberCOll).find({},
                                                                        {projection: {content: 0},
                                                                                    skip: skip,
                                                                                limit: limit || 1}).toArray();
            if(blogs){
                return Promise.resolve({status:"success", blogs: blogs});
            }else{
                return Promise.reject({status: "error", error: "Updation Error", logmessage: "Couldn't found subscriber"});
            }
        }).catch(error => {
        return Promise.reject({status: "error", error: error, logmessage: "Failed to connect database"});
    });
}