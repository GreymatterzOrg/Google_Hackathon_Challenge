from bson import ObjectId

def serialize_object(obj):
    if isinstance(obj, ObjectId):
        return str(obj)
    if isinstance(obj, list):
        return [serialize_object(item) for item in obj]
    if isinstance(obj, dict):
        return {key: serialize_object(value) for key, value in obj.items()}
    return obj

