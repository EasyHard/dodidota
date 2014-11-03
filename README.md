* What is Dodidota?

Dodidota is an express-based web site which tries to re-organize dota videos in Youku
and present them in a better way. I launch it for some times. But now it is closed.

It is pretty much the same as http://www.gosugamers.net/dota2/tournaments/ (with
less tournament). i.e. A list of dota tournaments. And after you click a
tournament, dodidota will show you a straightforward bracket. Instead of showing
match details like ban/pick and editor-selected video on youtube, dodidota shows
a list of youku videos that dodidota's algorithm believes it belongs to that
match.

* How does the algorithm works?

Ideally dodidota could fetch tournament data from gosugamers, including
tournament schedule, participants. (But as a prototype this part is done
manually.) After that, dodidota regularly fetch tournament progress from gosugamers. It
also regularly fetch newest video via Youku's API.

There are lots types dota video in Youku. And I want to find videos for
match. To address that, dodidota uses a bayes classifier to determine which
videos are recording dota matches. 

After that, dodidota uses keywords like short names of tournaments and teams,
video upload time to find out Youku videos for a particular match. You could
check `tournamentSchema.methods.addVideo` for details.
