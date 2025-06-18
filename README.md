# Orpheus Art Voter
This is a voting application for Hack Club Orpheus art. In the end, there should be a ranking of Orpheus art pieces based on the sets received. Decide which ones are the coolest through a continous voting process which involves ordering 4 random images against each other. The database will then collect the images and then decide how to rank them using all the orders received. Generally, more votes will yield more accurate results. The leaderboard is freely available to anyone.

## Credits
Credit to *Max Wofford* for creating the commits to the images used in the page and for the favicon. The Orpheus images can be found at [Hack Club Dinosaurs](https://github.com/hackclub/dinosaurs). The ranking algorithm is based off of an eigenvalue algorithm called *power iteration*. Credits to *Anagh Phanse* for providing a JS implementation. It has been modified by LLMs for clarity and usage.

## Creation
This project has been made for a YSWS (You Ship, We Ship) called *Shipwrecked* by *Hack Club*. Before joining the YSWS, I was interested in art of the mascot of Hack Club, *Orpheus*. It was hard to find the best art, as they were randomly ordered. This project was created to solve that by allowing users to decide which ones are the best.

## Installation
To host the project, first install *Deno.JS*, the JavaScript runtime engine used for this project. Then, download the project files and place it all in one directory. In the command prompt or terminal, navigate to the project directory. Then, use the command `deno run -A backend/storage/host.js`. Afterwards, the project should be hosted on port `8200`.

## File Management
In the case of malicious action, there must be a way to revert the actions. If someone submits a lot of invalid orderings, it can be found in `backend/storage/orders.txt`. Each ordering is separated by a newline. It contains the IP address, the timestamp, and the order itself. From there, it can be filtered to remove any malicious action.

The `served.json` file can be rebuilt by using `ranker.inferServed()`, which will infer the `served.json` file from the `orders.txt` file.

## Support
The program supports both mouse interactions and touch, but only with one finger at a time. Keyboard interaction may be added in the future, but not at the moment because it works fine as-is.