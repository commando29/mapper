import requests
import pymongo

mongo_user = "admin"
mongo_pass = "p@ssw0rd"

def connect_to_mapper_database(username, password):
    # Connect to MongoDB
    # client = pymongo.MongoClient(f"mongodb+srv://{username}:{password}@cluster0.hkkzkeu.mongodb.net/test")
    client = pymongo.MongoClient(f"mongodb+srv://admin:p%40ssw0rd@cluster0.hkkzkeu.mongodb.net/test")
    db = client["mapper"]
    
    print("Connected to the MongoDB database successfully!")
    return db

""" def update_system_collection():
    # Request data from Eve Online API
    response = requests.get('https://esi.evetech.net/v1/universe/systems/')
    if response.ok:
        systems = response.json()
        
        # Connect to MongoDB
        db = connect_to_mapper_database(mongo_user, mongo_pass)
        system_collection = db["systems"]
        
        # Update the collection
        for system_id in systems:
            system_collection.update_one(
                {"system_id": system_id},
                {"$set": {"system_id": system_id}},
                upsert=True
            )
            update_system_details(system_id)
            
        print("System collection updated successfully!")
    else:
        print(f'The API response was not successful. Reason: {response.reason}')
        return None

def update_system_details(system_id):
    # Request data from Eve Online API
    response = requests.get(f'https://esi.evetech.net/v4/universe/systems/{system_id}/')
    if response.ok:
        system = response.json()
        
        # Connect to MongoDB
        db = connect_to_mapper_database(mongo_user, mongo_pass)
        system_collection = db["systems"]
        
        # Update the collection
        system_collection.update_one(
            {"system_id": system_id},
            {"$set": system},
            upsert=True
        )
        
        print(f"System details for system id {system_id} updated successfully!")
    else:
        print(f'The API response was not successful for system id {system_id}. Reason: {response.reason}')
        return None """

def update_collection(name):
    # Request data from Eve Online API
    response = requests.get(f'https://esi.evetech.net/latest/universe/{name}s/')
    if response.ok:
        data = response.json()
        
        # Connect to MongoDB
        db = connect_to_mapper_database(mongo_user, mongo_pass)
        data_collection = db[name + 's']
        
        # Update the collection
        for item_id in data:
            data_collection.update_one(
                {name + "_id": item_id},
                {"$set": {name + "_id": item_id}},
                upsert=True
            )
            update_collection_details(name, item_id)
            
        print(f"{name} collection updated successfully!")
    else:
        print(f'The API response was not successful. Reason: {response.reason}')
        return None

def update_collection_details(name, item_id):
    # Request data from Eve Online API
    response = requests.get(f'https://esi.evetech.net/latest/universe/{name}s/{item_id}/')
    if response.ok:
        item = response.json()
        
        # Connect to MongoDB
        db = connect_to_mapper_database(mongo_user, mongo_pass)
        data_collection = db[name + 's']
        
        # Update the collection
        data_collection.update_one(
            {name + "_id": item_id},
            {"$set": item},
            upsert=True
        )
        
        print(f"{name} details for item id {item_id} updated successfully!")
    else:
        print(f'The API response was not successful for {name} id {item_id}. Reason: {response.reason}')
        return None
        
def update_universe_collections():
    # collection_names = ["system", "constellation", "region"]
    collection_names = ["stargate"]
    for name in collection_names:
        update_collection(name)

def update_stargates():
    db = connect_to_mapper_database(mongo_user, mongo_pass)
    systems_collection = db['systems']
    for system in systems_collection.find():
        if "stargates" in system:
            systems_collection.update_one({"system_id": system["system_id"]}, {"$set": {"connected_systems": []}})
            for stargate_id in system["stargates"]:
                # TODO: remove if
                stargates = db['stargates']
                data = update_stargate(stargate_id, stargates)
                if data is not None:
                    systems_collection.update_one({"system_id": system["system_id"]}, {"$push": {"connected_systems": data['destination']['system_id']}})
        else:
            print(f"System {system['system_id']} doesn't have any stargates.")
        

def update_stargate(stargate_id, stargate_collection):

    response = requests.get(f'https://esi.evetech.net/latest/universe/stargates/{stargate_id}/')
    if response.ok:
        #db = connect_to_mapper_database(mongo_user, mongo_pass)
        stargate_data = response.json()
        #stargate_collection = db['stargates']
        
        # Update the collection
        stargate_collection.update_one(
            {"stargate_id": stargate_id},
            {"$set": stargate_data},
            upsert=True
        )
        
        print(f"Stargate details for item id {stargate_id} updated successfully!")
        # system["connected_systems"].append(stargate_data['destination']['system_id'])
        return stargate_data
    else:
        print(f'The API response was not successful for stargate id {stargate_id}. Reason: {response.reason}')
        return None


def calculate_jumps(depth):
    db = connect_to_mapper_database(mongo_user, mongo_pass)
    systems_collection = db['systems']
    systems_map=[]
    for system in systems_collection.find():
        if "connected_systems" in system: 
            current_system_list=system["connected_systems"]
            for x in range(depth):
                systems_map.append(current_system_list.copy())
                current_system_list = find_systems_within_one_jump_of_list(current_system_list, systems_collection)
                if len(current_system_list) > 200:
                    break
            if current_system_list is not None:
                systems_map.append(current_system_list.copy())
            systems_collection.update_one({"system_id": system["system_id"]}, {"$set": {"systems_network": systems_map}})
    


def find_systems_within_one_jump_of_list(system_id_list, systems_collection):
    return_list=[]
    for system_id in system_id_list:
        system_details = systems_collection.find_one({"system_id": system_id})
        if (system_details):
            return_list.extend(system_details["connected_systems"])
    return list(set(return_list))



#update_universe_collections()
#update_stargates()
calculate_jumps(5)