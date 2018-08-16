AddEventHandler("onDatabaseConnect", function (databaseName)
    print("[MongoDB][Example] onDatabaseConnect: "..tostring(databaseName))

    exports.mongodb:collection("users")
    exports.mongodb:find({ username = "User42" }, { limit = 1 }, function (documents)
        if #documents > 0 then
            print("[MongoDB][Example] User is already created")
            print("\n*** User document ***")
            for k, v in pairs(documents[1]) do
                print("* "..tostring(k).." = \""..tostring(v).."\"")
            end
            return
        end

        exports.mongodb:insert({ username = "User42", password = "123" }, {}, function (insertedCount)
            print("[MongoDB][Example] Inserted "..tostring(insertedCount).." document(s)")
        end)
    end)
end)
