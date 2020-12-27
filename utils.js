const mongodb = require("mongodb");

function exportDocument(document) {
    if (!document) return;
    if (document._id && typeof document._id !== "string") {
        document._id = document._id.toString();
    }
    return document;
};

function exportDocuments(documents) {
    if (!Array.isArray(documents)) return;
    return documents.map((document => exportDocument(document)));
}

function safeObjectArgument(object) {
    if (!object) return {};
    if (Array.isArray(object)) {
        return object.reduce((acc, value, index) => {
            acc[index] = value;
            return acc;
        }, {});
    }
    if (typeof object !== "object") return {};
    if (object._id) object._id = mongodb.ObjectID(object._id);
    return object;
}

function safeCallback(cb, ...args) {
    if (typeof cb === "function") return setImmediate(() => cb(...args));
    else return false;
}

module.exports = {
    exportDocument,
    exportDocuments,
    safeObjectArgument,
    safeCallback
}