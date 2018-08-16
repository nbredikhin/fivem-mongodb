const mongodb = require("mongodb");
const utils = require("./utils");

const url = GetConvar("mongodb_url");
const dbName = GetConvar("mongodb_database");

let db;
let collection;

mongodb.MongoClient.connect(url, { useNewUrlParser: true },function (err, client) {
    if (err) return print("Error: " + err.message);
    db = client.db(dbName);

    console.log(`[MongoDB] Connected to database "${dbName}".`);
    emit("onDatabaseConnect", dbName);
});

exports("isConnected", () => !!db);

exports("collection", name => {
    collection = db.collection(name);
});

exports("find", (query, options, callback) => {
    if (!db) return console.log(`[MongoDB][ERROR] Database is not connected.`);
    if (!collection) return console.log(`[MongoDB][ERROR] Collection is not selected. Use exports.collection first.`);

    query = utils.safeObjectArgument(query);
    options = utils.safeObjectArgument(options);

    let cursor = collection.find(query, options);
    if (options.limit) cursor = cursor.limit(options.limit);
    cursor.toArray((err, documents) => {
        if (err) return console.log(`[MongoDB][ERROR] exports.find: Error "${err.message}".`);
        utils.safeCallback(callback, utils.exportDocuments(documents));
    });
    process._tickCallback();
});

exports("count", (query, options, callback) => {
    if (!db) return console.log(`[MongoDB][ERROR] Database is not connected.`);
    if (!collection) return console.log(`[MongoDB][ERROR] Collection is not selected. Use exports.collection first.`);

    query = utils.safeObjectArgument(query);
    options = utils.safeObjectArgument(options);

    collection.count(query, options, (err, count) => {
        if (err) return console.log(`[MongoDB][ERROR] exports.count: Error "${err.message}".`);
        utils.safeCallback(callback, count);
    });
    process._tickCallback();
});

exports("insert", (documents, options, callback) => {
    if (!db) return console.log(`[MongoDB][ERROR] Database is not connected.`);
    if (!collection) return console.log(`[MongoDB][ERROR] Collection is not selected. Use exports.collection first.`);
    if (typeof documents == "object") documents = [documents];
    if (!documents || !Array.isArray(documents))
        return console.log(`[MongoDB][ERROR] exports.insert: Invalid 'documents' argument. Expected object or array of objects.`);

    options = utils.safeObjectArgument(options);

    collection.insertMany(documents, (err, result) => {
        if (err) return console.log(`[MongoDB][ERROR] exports.insert: Error "${err.message}".`);
        utils.safeCallback(callback, result.insertedCount);
    });
    process._tickCallback();
});

exports("updateOne", (filter, update, callback) => {
    if (!db) return console.log(`[MongoDB][ERROR] Database is not connected.`);
    if (!collection) return console.log(`[MongoDB][ERROR] Collection is not selected. Use exports.collection first.`);

    filter = utils.safeObjectArgument(filter);
    update = utils.safeObjectArgument(update);

    collection.updateOne(filter, update, (err, res) => {
        if (err) return console.log(`[MongoDB][ERROR] exports.update: Error "${err.message}".`);
        utils.safeCallback(callback, res.result.nModified);
    });
    process._tickCallback();
});

exports("updateMany", (filter, update, callback) => {
    if (!db) return console.log(`[MongoDB][ERROR] Database is not connected.`);
    if (!collection) return console.log(`[MongoDB][ERROR] Collection is not selected. Use exports.collection first.`);

    filter = utils.safeObjectArgument(filter);
    update = utils.safeObjectArgument(update);

    collection.updateMany(filter, update, (err, res) => {
        if (err) return console.log(`[MongoDB][ERROR] exports.update: Error "${err.message}".`);
        utils.safeCallback(callback, res.result.nModified);
    });
    process._tickCallback();
});


exports("remove", (filter, callback) => {
    if (!db) return console.log(`[MongoDB][ERROR] Database is not connected.`);
    if (!collection) return console.log(`[MongoDB][ERROR] Collection is not selected. Use exports.collection first.`);

    filter = utils.safeObjectArgument(filter);

    collection.remove(filter, (err, res) => {
        if (err) return console.log(`[MongoDB][ERROR] exports.remove: Error "${err.message}".`);
        utils.safeCallback(callback, res.result.n);
    });
    process._tickCallback();
});
