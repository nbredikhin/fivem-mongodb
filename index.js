const mongodb = require("mongodb");
const utils = require("./utils");

const url = GetConvar("mongodb_url", "changeme");
const dbName = GetConvar("mongodb_database", "changeme");

let db;

if (url != "changeme" && dbName != "changeme") {
    mongodb.MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {
        if (err) return console.log("[MongoDB][ERROR] Failed to connect: " + err.message);
        db = client.db(dbName);

        console.log(`[MongoDB] Connected to database "${dbName}".`);
        emit("onDatabaseConnect", dbName);
    });
} else {
    if (url == "changeme") console.log(`[MongoDB][ERROR] Convar "mongodb_url" not set (see README)`);
    if (dbName == "changeme") console.log(`[MongoDB][ERROR] Convar "mongodb_database" not set (see README)`);
}

function checkDatabaseReady() {
    if (!db) {
        console.log(`[MongoDB][ERROR] Database is not connected.`);
        return false;
    }
    return true;
}

function checkParams(params) {
    return params !== null && typeof params === 'object';
}

function getParamsCollection(params) {
    if (!params.collection) return;
    return db.collection(params.collection)
}

/* MongoDB methods wrappers */

/**
 * MongoDB insert method
 * @param {Object} params - Params object
 * @param {Array}  params.documents - An array of documents to insert.
 * @param {Object} params.options - Options passed to insert.
 */
function dbInsert(params, callback) {
    if (!checkDatabaseReady()) return;
    if (!checkParams(params)) return console.log(`[MongoDB][ERROR] exports.insert: Invalid params object.`);

    let collection = getParamsCollection(params);
    if (!collection) return console.log(`[MongoDB][ERROR] exports.insert: Invalid collection "${params.collection}"`);

    let documents = params.documents;
    if (!documents || !Array.isArray(documents))
        return console.log(`[MongoDB][ERROR] exports.insert: Invalid 'params.documents' value. Expected object or array of objects.`);

    const options = utils.safeObjectArgument(params.options);

    collection.insertMany(documents, options, (err, result) => {
        if (err) {
            console.log(`[MongoDB][ERROR] exports.insert: Error "${err.message}".`);
            utils.safeCallback(callback, false, err.message);
            return;
        }
        let arrayOfIds = [];
        // Convert object to an array
        for (let key in result.insertedIds) {
            if (result.insertedIds.hasOwnProperty(key)) {
                arrayOfIds[parseInt(key)] = result.insertedIds[key].toString();
            }
        }
        utils.safeCallback(callback, true, result.insertedCount, arrayOfIds);
    });
    process._tickCallback();
}

/**
 * MongoDB find method
 * @param {Object} params - Params object
 * @param {Object} params.query - Query object.
 * @param {Object} params.options - Options passed to insert.
 * @param {number} params.limit - Limit documents count.
 */
function dbFind(params, callback) {
    if (!checkDatabaseReady()) return;
    if (!checkParams(params)) return console.log(`[MongoDB][ERROR] exports.find: Invalid params object.`);

    let collection = getParamsCollection(params);
    if (!collection) return console.log(`[MongoDB][ERROR] exports.insert: Invalid collection "${params.collection}"`);

    const query = utils.safeObjectArgument(params.query);
    const options = utils.safeObjectArgument(params.options);

    let cursor = collection.find(query, options);
    if (params.limit) cursor = cursor.limit(params.limit);
    cursor.toArray((err, documents) => {
        if (err) {
            console.log(`[MongoDB][ERROR] exports.find: Error "${err.message}".`);
            utils.safeCallback(callback, false, err.message);
            return;
        };
        utils.safeCallback(callback, true, utils.exportDocuments(documents));
    });
    process._tickCallback();
}

/**
 * MongoDB update method
 * @param {Object} params - Params object
 * @param {Object} params.query - Filter query object.
 * @param {Object} params.update - Update query object.
 * @param {Object} params.options - Options passed to insert.
 */
function dbUpdate(params, callback, isUpdateOne) {
    if (!checkDatabaseReady()) return;
    if (!checkParams(params)) return console.log(`[MongoDB][ERROR] exports.update: Invalid params object.`);

    let collection = getParamsCollection(params);
    if (!collection) return console.log(`[MongoDB][ERROR] exports.insert: Invalid collection "${params.collection}"`);

    query = utils.safeObjectArgument(params.query);
    update = utils.safeObjectArgument(params.update);
    options = utils.safeObjectArgument(params.options);

    const cb = (err, res) => {
        if (err) {
            console.log(`[MongoDB][ERROR] exports.update: Error "${err.message}".`);
            utils.safeCallback(callback, false, err.message);
            return;
        }
        utils.safeCallback(callback, true, res.result.nModified);
    };
    isUpdateOne ? collection.updateOne(query, update, options, cb) : collection.updateMany(query, update, options, cb);
    process._tickCallback();
}

/**
 * MongoDB count method
 * @param {Object} params - Params object
 * @param {Object} params.query - Query object.
 * @param {Object} params.options - Options passed to insert.
 */
function dbCount(params, callback) {
    if (!checkDatabaseReady()) return;
    if (!checkParams(params)) return console.log(`[MongoDB][ERROR] exports.count: Invalid params object.`);

    let collection = getParamsCollection(params);
    if (!collection) return console.log(`[MongoDB][ERROR] exports.insert: Invalid collection "${params.collection}"`);

    const query = utils.safeObjectArgument(params.query);
    const options = utils.safeObjectArgument(params.options);

    collection.countDocuments(query, options, (err, count) => {
        if (err) {
            console.log(`[MongoDB][ERROR] exports.count: Error "${err.message}".`);
            utils.safeCallback(callback, false, err.message);
            return;
        }
        utils.safeCallback(callback, true, count);
    });
    process._tickCallback();
}

/**
 * MongoDB delete method
 * @param {Object} params - Params object
 * @param {Object} params.query - Query object.
 * @param {Object} params.options - Options passed to insert.
 */
function dbDelete(params, callback, isDeleteOne) {
    if (!checkDatabaseReady()) return;
    if (!checkParams(params)) return console.log(`[MongoDB][ERROR] exports.delete: Invalid params object.`);

    let collection = getParamsCollection(params);
    if (!collection) return console.log(`[MongoDB][ERROR] exports.insert: Invalid collection "${params.collection}"`);

    const query = utils.safeObjectArgument(params.query);
    const options = utils.safeObjectArgument(params.options);

    const cb = (err, res) => {
        if (err) {
            console.log(`[MongoDB][ERROR] exports.delete: Error "${err.message}".`);
            utils.safeCallback(callback, false, err.message);
            return;
        }
        utils.safeCallback(callback, true, res.result.n);
    };
    isDeleteOne ? collection.deleteOne(query, options, cb) : collection.deleteMany(query, options, cb);
    process._tickCallback();
}

/* Exports definitions */

exports("isConnected", () => !!db);

exports("insert", dbInsert);
exports("insertOne", (params, callback) => {
    if (checkParams(params)) {
        params.documents = [params.document];
        params.document = null;
    }
    return dbInsert(params, callback)
});

exports("find", dbFind);
exports("findOne", (params, callback) => {
    if (checkParams(params)) params.limit = 1;
    return dbFind(params, callback);
});

exports("update", dbUpdate);
exports("updateOne", (params, callback) => {
    return dbUpdate(params, callback, true);
});

exports("count", dbCount);

exports("delete", dbDelete);
exports("deleteOne", (params, callback) => {
    return dbDelete(params, callback, true);
});
