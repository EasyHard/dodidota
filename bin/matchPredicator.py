import pymongo
from pymongo import MongoClient
client = MongoClient()
db = client.test
videos = db.videos
import jieba
import pickle
with open('isamatch', 'r') as f:
    isamatch = pickle.load(f);
with open('notamatch', 'r') as f:
    notamatch = pickle.load(f);
nis = isamatch['totalisamatch']
nnot = notamatch['totalnotamatch']

from math import log
def predict(video):
    seg_list = jieba.cut(video['title'], cut_all=False)
    ians = -999999
    for seg in seg_list:
        try:
            ians += log(isamatch.get(seg, nis)/float(nis))
        except ValueError:
            print isamatch.get(seg, nis)/nis
    nans = -999999
    seg_list = jieba.cut(video['title'], cut_all=False)
    for seg in seg_list:
        nans += log(notamatch.get(seg, nnot)/float(nnot))
    if (ians > nans):
        return 'isamatch'
    else:
        return 'notamatch'

if __name__ == "__main__":
    v = videos.find({'match.manuallySet':True})
    total = videos.find({'match.manuallySet':True}).count();
    error = []
    for x in v:
        ptype = predict(x)
        if ptype != x['match']['type']:
            error.append(x)
    print 'error:', float(len(error))/total
    for x in error:
        print x['title']
