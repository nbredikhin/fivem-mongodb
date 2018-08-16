# FiveM MongoDB wrapper
### WARNING: Resource is still in early development and API may change!

## Installation

1. Clone this repository to `resources/mongodb` folder.
2. Copy `mongodb/database.cfg` to your server root directory.
3. Add the following lines to your server config:
```
exec "database.cfg"
start mongodb
```
4. Change `mongodb_url` and `mongodb_database` in `database.cfg`.

## Usage
### WARNING: Resource is still in early development and API may change!

You can find a simple usage example in `example.lua` file.
```js
exports.mongodb.find(query, options, callback)
exports.mongodb.count(query, options, callback)
exports.mongodb.insert(documents, options, callback)
exports.mongodb.updateOne(filter, update, callback)
exports.mongodb.updateMany(filter, update, callback)
exports.mongodb.remove(filter, callback)
```
