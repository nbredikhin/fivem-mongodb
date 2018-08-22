local function printFiveUsers()
    local params = {
        collection = "users",
        query = {},
        limit = 5,
        options = {
            -- Include username and exclude _id field
            projection = {username = 1, _id = 0}
        }
    }
    exports.mongodb:find(params, function (success, result)
        if not success then
            return
        end

        print("\n** 5 users")
        for i, document in ipairs(result) do
            for k, v in pairs(document) do
                print("* "..tostring(k).." = \""..tostring(v).."\"")
            end
        end
    end)
end

local function printUser(id)
    exports.mongodb:findOne({ collection="users", query = { _id = id } }, function (success, result)
        if not success then
            return
        end
        print("\n** User document")
        for k, v in pairs(result[1]) do
            print("* "..tostring(k).." = \""..tostring(v).."\"")
        end
    end)
end

AddEventHandler("onDatabaseConnect", function (databaseName)
    print("[MongoDB][Example] onDatabaseConnect: "..tostring(databaseName))

    local username = "User0"

    -- Find user by username
    exports.mongodb:findOne({ collection="users", query = { username = username } }, function (success, result)
        if not success then
            print("[MongoDB][Example] Error in findOne: "..tostring(result))
            return
        end
        -- Print user if already exists
        if #result > 0 then
            print("[MongoDB][Example] User is already created")
            printUser(result[1]._id)
            exports.mongodb:updateOne({ collection="users", query = { _id = result[1]._id }, update = { ["$set"] = { first_name = "Bob" } } })
            return
        end
        print("[MongoDB][Example] User does not exist. Creating...")
        exports.mongodb:insertOne({ collection="users", document = { username = username, password = "123" } }, function (success, result, insertedIds)
            if not success then
                print("[MongoDB][Example] Error in insertOne: "..tostring(result))
                return
            end
            print("[MongoDB][Example] User created. New ID: "..tostring(insertedIds[1]))
            printUser(insertedIds[1])
        end)
    end)

    exports.mongodb:count({collection="users"}, function (success, result)
        if not success then
            print("[MongoDB][Example] Error in count: "..tostring(result))
            return
        end
        print("[MongoDB][Example] Current users count: "..tostring(result))
        if result < 10 then
            local insertUsers = {}
            for i = 1, 10 do
                table.insert(insertUsers, { username = "User"..i, password = "123456" })
            end

            exports.mongodb:insert({ collection="users", documents = insertUsers }, function (success, result)
                if not success then
                    print("[MongoDB][Example] Failed to insert users: "..tostring(result))
                    return
                end
                print("[MongoDB][Example] Inserted "..tostring(result).." new users")

                printFiveUsers()
            end)
        else
            printFiveUsers()
        end
    end)
end)
