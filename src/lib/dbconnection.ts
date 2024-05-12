import {MongoClient, ObjectId} from 'mongodb';
import * as crypto from "node:crypto";

const username = encodeURIComponent("fbadmin");
const password = encodeURIComponent("my_password");
const clusterUrl = process.env.MONGODB_URI || 'localhost:27017';
const dbName = "foodblogdb";

const salt: string = "1234567890";

//const authMechanism = "DEFAULT";

if (!clusterUrl) {
    throw new Error("$MONGODB_URI is missing");
}

const uri = `mongodb://${username}:${password}@${clusterUrl}/${dbName}`;            /*?authMechanism=${authMechanism};*/
const options = process.env.NODE_ENV === 'development' ? {monitorCommands: true} : {};

const subscriberCOll = "subscribers";
const blogsCollection = "blogs";

const client = new MongoClient(uri, options);

if (process.env.NODE_ENV === 'development') {
    client.on('commandStarted', (event) => console.debug(event));
    client.on('commandSucceeded', (event) => console.debug(JSON.stringify(event.reply)));
    client.on('commandFailed', (event) => console.debug(event));
}

type Subscriber = {
    id?: string,
    name: string,
    email: string,
    about: string,
    emailValidated: boolean,
    authdetails: {
        password?: string,
        account_type: [],
        auth_type: string,
        auth_id: string
    }
    creationdate?: Date,
    modifieddate?: Date
}

type Blog = {
    id?: string
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
export async function addSubscriber(isubscriber: Readonly<Subscriber>): Promise<any> {
    let subscriber: Subscriber = isubscriber;
    try {
        await client.connect();
        const db = client.db(dbName);
        const hashPassword = crypto.pbkdf2Sync(subscriber.authdetails.password as crypto.BinaryLike, salt, 100, 64, 'sha512');
        console.log("addSubscriber: database successfully connected - ", db.databaseName);
        subscriber.authdetails.password = hashPassword.toString();
        subscriber.emailValidated = false;
        const {
            acknowledged,
            insertedId
        } = await db.collection(subscriberCOll).insertOne({createdDate: new Date(), ...subscriber});
        await client.close();
        if (acknowledged) {
            //Hashed value shouldn't go beyond this point
            if(subscriber.authdetails.password){
                delete subscriber.authdetails.password;
            }
            return {status: "success", subscriber: {id: insertedId.toString(), ...subscriber}};
        } else {
            return {
                status: "error",
                error: "Insert Error",
                logmessage: "Failed to insert document into database"
            };
        }
    } catch (error: any) {
        console.log("addSubscriber: error occurred while connecting db: ", error.message);
        throw error;
    }
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
export async function deleteSubscriber(subscriberid: string): Promise<any> {
    client.connect()
        .then(async connectedClient => {
            const db = connectedClient.db(dbName);
            const query = {_id: new ObjectId(subscriberid)};
            const {acknowledged, deletedCount} = await db.collection(subscriberCOll).deleteOne(query);
            if (acknowledged && deletedCount) {
                return Promise.resolve({status: "success", deletedCount: deletedCount});
            } else {
                return Promise.reject({
                    status: "error",
                    error: "Deletion Error",
                    logmessage: "Failed to delete subscription"
                });
            }
        }).catch(error => {
        return Promise.reject({status: "error", error: error, logmessage: "Failed to connect database"});
    });
}

export async function addRolesSubscriber(emailid: string, roles: string[] ): Promise<any> {
    try {
        return await new Promise(async (resolve, reject) => {
            client.connect().then(async (connectedClient) => {
                const db = connectedClient.db(dbName);
                const query = {email: emailid};
                const result = await db.collection<Subscriber>(subscriberCOll).updateOne(query, {$push: {'authdetails.account_type': {$each: roles}}} , {upsert: false});
                console.log("addRolesSubscriber:", result);
                resolve(result);
            }).catch(err =>{
                reject(err);
            }).catch(error => reject(error));
        });
    }catch(error) {
        console.error("Error: ", error);
        throw error;
    }
}

export async function deleteRolesSubscriber(emailid: string, roles: string[] ): Promise<any> {
    try {
        return await new Promise(async (resolve, reject) => {
            client.connect().then(async (connectedClient) => {
                const db = connectedClient.db(dbName);
                const query = {email: emailid};
                const result = await db.collection<Subscriber>(subscriberCOll).updateOne(query, {$pull: {'authdetails.account_type': {$in: roles}}} );
                resolve(result);
            }).catch(err =>{
                reject(err);
            }).catch(error => reject(error));
        });
    }catch(error) {
        console.error("Error: ", error);
        throw error;
    }
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
/*export async function modifySubscriber(id: string, data: {}): Promise<any> {
    client.connect()
        .then(async connectedClient => {
            const db = connectedClient.db(dbName);
            let query;
            query = {_id: new ObjectId(data.id)};
            const {
                acknowledged,
                modifiedCount
            } = await db.collection(subscriberCOll).updateOne(query, {$set: data});
            if (acknowledged && modifiedCount) {
                return Promise.resolve({status: "success", modifiedCount: modifiedCount});
            } else {
                return Promise.reject({
                    status: "error",
                    error: "Updation Error",
                    logmessage: "Failed to update subscription"
                });
            }
        }).catch(error => {
        return Promise.reject({status: "error", error: error, logmessage: "Failed to connect database"});
    });
}*/

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
export async function getSubscriber(emailid: string, passwd ?: string): Promise<any> {
    try{
        return await new Promise((resolve, reject) => {
            client.connect()
                .then(async connectedClient => {
                    const db = connectedClient.db(dbName);
                    let query;
                    if (passwd !== undefined && passwd !== null) {
                        const hashPassword = crypto.pbkdf2Sync(passwd as crypto.BinaryLike, salt, 100, 64, 'sha512');
                        query = {email: emailid, 'authdetails.password': hashPassword.toString()};
                    } else {
                        query = {email: emailid};
                    }
                    const subscriber = await db.collection(subscriberCOll).findOne(query, {projection: {'authdetails.password': 0}});
                    if (subscriber) {
                        resolve({status: "success", subscriber: subscriber});
                    } else {
                        resolve({
                            status: "failed",
                            logmessage: "Couldn't found subscriber"
                        });
                    }
                }).catch(error => {
                    console.error("connection error: ", error);
                    reject({status: "error", error: error, logmessage: "Failed to connect database"});
            });
        });
    }catch (err){
        console.error("Error while getting the subscriber details ", err);
        throw err;
    }

}

/*
* This function retrieves list of documents from the collection
*
* @function
* @async
* @param {string} id - id of the subscriber
* @param {string} passwd - optional password string
* @return {Promise<Subscriber>} A promise which resolves to Subscriber object
*                               and rejects with error message in case of failure.
 */
export async function getSubscribers(skip: number, limit: number): Promise<any> {
    try{
        return await new Promise((resolve, reject) => {
            client.connect()
                .then(async connectedClient => {
                    const db = connectedClient.db(dbName);
                    const query = {};
                    const subscribers = await db.collection(subscriberCOll).find(query, {
                        projection: {authdetails: 0},
                        skip: skip,
                        limit: limit
                    }).toArray();
                    if (subscribers && subscribers.length > 0) {
                        console.log("getSubscribers: fetched ", subscribers.length, "number of subscribers ");
                        resolve({status: "success", subscriber: subscribers});
                    } else {
                        console.log("getSubscribers: not found subscribers");
                        resolve({
                            status: "success",
                            subscriber: [],
                            logmessage: "Couldn't found subscriber"
                        });
                    }
                }).catch(error => {
                    console.error("getSubscribers: Failed to connect database", error);
                    reject({status: "error", error: error, logmessage: "Failed to connect database"});
                });
        });
    }catch(err){
        console.error("Error getting list of subscribers", err);
        throw err;
    }

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
        .then(async connectedClient => {
            const db = connectedClient.db(dbName);
            const {acknowledged, insertedId} = await db.collection(blogsCollection).insertOne(blog);
            await client.close();
            if (acknowledged) {
                return Promise.resolve({status: "success", subscriber: {id: insertedId.toString(), ...blog}});
            } else {
                return Promise.reject({
                    status: "error",
                    error: "Insert Error",
                    logmessage: "Failed to insert document into database"
                });
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
export async function deleteBlog(blogid: string): Promise<any> {
    client.connect()
        .then(async connectedClient => {
            const db = connectedClient.db(dbName);
            const query = {_id: new ObjectId(blogid)};
            const {acknowledged, deletedCount} = await db.collection(blogsCollection).deleteOne(query);
            if (acknowledged && deletedCount) {
                return Promise.resolve({status: "success", deletedCount: deletedCount});
            } else {
                return Promise.reject({
                    status: "error",
                    error: "Deletion Error",
                    logmessage: "Failed to delete subscription"
                });
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
export async function modifyBlog(blog: Blog): Promise<any> {
    client.connect()
        .then(async connectedClient => {
            const db = connectedClient.db(dbName);
            const query = {_id: new ObjectId(blog.id)};
            const {acknowledged, modifiedCount} = await db.collection(subscriberCOll).updateOne(query, {$set: blog});
            if (acknowledged && modifiedCount) {
                return Promise.resolve({status: "success", modifiedCount: modifiedCount});
            } else {
                return Promise.reject({
                    status: "error",
                    error: "Updation Error",
                    logmessage: "Failed to update subscription"
                });
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
export async function getBlog(id: string): Promise<any> {
    client.connect()
        .then(async connectedClient => {
            const db = connectedClient.db(dbName);
            const query = {_id: new ObjectId(id)};
            const blog = await db.collection(subscriberCOll).findOne(query);
            if (blog) {
                return Promise.resolve({status: "success", blog: blog});
            } else {
                return Promise.reject({
                    status: "error",
                    error: "Updation Error",
                    logmessage: "Couldn't found subscriber"
                });
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
export async function getBlogs(skip: number, limit: number): Promise<any> {
    client.connect()
        .then(async connectedClient => {
            const db = connectedClient.db(dbName);
            const blogs = await db.collection(subscriberCOll).find({},
                {
                    projection: {content: 0},
                    skip: skip,
                    limit: limit || 1
                }).toArray();
            if (blogs) {
                return Promise.resolve({status: "success", blogs: blogs});
            } else {
                return Promise.reject({
                    status: "error",
                    error: "Updation Error",
                    logmessage: "Couldn't found subscriber"
                });
            }
        }).catch(error => {
        return Promise.reject({status: "error", error: error, logmessage: "Failed to connect database"});
    });
}