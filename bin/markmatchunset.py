import pymongo
from pymongo import MongoClient
client = MongoClient()
db = client.test
videos = db.videos
from matchPredicator import predict

v = videos.find({'match.type':'notset'})
for x in v:
    x['match']['type'] = predict(x)
    videos.save(x)
client.disconnect()
