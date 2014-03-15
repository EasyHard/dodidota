import pymongo
from pymongo import MongoClient
client = MongoClient()
db = client.test
videos = db.videos
import jieba
isamatch = {}
notamatch = {}

v = videos.find({'match.manuallySet':True})
for x in v:
    seg_list = jieba.cut(x['title'], cut_all=False)
    for seg in seg_list:
        if x['match']['type'] == 'isamatch':
            isamatch[seg] = isamatch.get(seg, 0) + 1;
        else:
            notamatch[seg] = notamatch.get(seg, 0) + 1;
delta = 0.0001
for k, v in isamatch.items():
    if not notamatch.has_key(k):
        notamatch[k] = delta
for k, v in notamatch.items():
    if not isamatch.has_key(k):
        isamatch[k] = delta

it = 0.0
for k, v in isamatch.items():
    it = it + isamatch[k];
nt = 0.0
for k, v in notamatch.items():
    nt = nt + notamatch[k];
isamatch['totalisamatch'] = it;
notamatch['totalnotamatch'] = nt;
# # balance
# nis = videos.find({'match.manuallySet':True, 'match.type':'isamatch'}).count()
# nnot = videos.find({'match.manuallySet':True, 'match.type':'notamatch'}).count()
# for k, v in isamatch.items():
#     isamatch[k] = float(v)/nis*nnot

# # total
# for k, v in isamatch.items():
#     total[k] = total.get(k, 0) + isamatch[k];

# for k, v in notamatch.items():
#     total[k] = total.get(k, 0) + notamatch[k];

import pickle
with open('isamatch', 'w') as f:
    pickle.dump(isamatch, f);
with open('notamatch', 'w') as f:
    pickle.dump(notamatch, f);
# with open('total', 'w') as f:
#     pickle.dump(total, f);


