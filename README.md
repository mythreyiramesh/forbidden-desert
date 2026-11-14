## About this implementation of Forbidden Desert

Recently, our board game group has become heavily invested in finding out a way to beat this game. We love the cooperative nature of it, and thank the creator for this incredible game. This React version was created to make our board game nights easier to do over screenshare since we're not in the same city anymore. Having said that, this is literally a stand-in for the actual game, and doesn't do most of the automations that are possible in a digital game. For the real stuff, check out the official game at https://www.forbiddendesert.com.

I put together this "app" with no background of React or even JavaScript with the help of Claude (Sonnet and Haiku). So, the practices will certainly not be optimal and there are a million ways to make this better. I used Ideogram to get some of the artwork and did some fixes myself with Inkscape. I haven't bothered to include a lot of CSS to prettify the app, and there are some quirks with the gameplay as well. Read below to actually try the game out for yourself.

## How to Play

The official rules are available somewhere on https://boardgamegeek.com/boardgame/136063/forbidden-desert. I have allowed 1 and 6 player games although that's not recommended in the official game. 

### Mechanics - what is automated, what isn't

Assuming you know how to play the actual game, keep these in mind when using this web app:

1. Set up the game: no of players, choice of players and the order of play. Freeze the options and Start Game.
2. The players will all start on a random tile (the back could be a gear, or not. This is different from the actual game).
3. Players can be dragged and dropped. The web app doesn't check that your actions are legal; that's up to you. It does keep count for you: the turn panel shows whose turn it is, how many actions are left (4 a turn) and how many storm cards have been drawn out of how many you must draw, and it tells you when to draw and when to pass the turn. It counts moving the current player, removing sand, excavating and picking up a part. Moving another player (for example the Climber carrying someone), sharing water and using most equipment are free. The Time Throttler adds 2 actions automatically. If the count is off (a Dune Blaster that removed sand for free, say), use the − and + beside the action count.
4. Click on sand markers to remove sand one at a time. Sand clearing action cannot be undone.
5. Adjust water levels near players to share water or gain water from wells. Gaining water isn't automatic, and if you see a lake that's a real well, the fake well is just dunes. All three will have a water emoji when unexcavated.
8. Equipments must be assigned to players manually and can be used once assigned. Dune Blaster, Jet Pack, Water Reserve are all up to you to keep track. Terrascope lets you peek at a tile, and the peeked tile will permanently display the description of what you'll find on excavation. Solar Shield will activate shielding from the sun, but you must make sure to turn it off once it's active period is done.
6. Draw storm cards equal to what is displayed on the left; the turn panel counts them for you but won't stop you drawing more. The storm effects are applied automatically. If sun beats down, even players in tunnel and those protected by active solar shields don't lost water. If you've made a mistake by not turning off Solar Shield, turn it off, and adjust water back manually.
7. Solar Shielding logic assumes that the same player will not use two Solar Shields at once. You may see undefined behaviour if you try enough.
9. Once both vertical and horizontal clues have been excavated, the parts become draggable. Once you drop the part on a tile, it can't be moved. Make sure to drop it correctly. A check box appears to pick up the part if rules are met.
10. Players can not blocked from entering blocked tiles by the app, you must figure out whether you're making legal moves.
11. Storm Deck has an extra shuffle button, be careful when nearing the end of the deck and don't include shuffle as one of the storm cards.
12. Number of Sun and Storm cards left are displayed below the storm deck, so are the number of cards.
13. Meteologist being present in the game will enable "Reveal" action near storm deck. Cards equal to number to draw will be revealed, and one can be optionally sent to the bottom.
14. If one of the loss conditions or the win condition is met, a message pops up and the board stops accepting changes. Press Undo to take back the last move, or New Game to start again.
15. The game saves itself in your browser, so a refresh keeps your game. Undo steps back through your moves, including storm draws.
16. The log on the left lists what happened, turn by turn, newest first.
17. The Corrections button shows tools for when the app and your real board disagree: a + on every tile to add sand, the storm level and the sand pile (− and +), and a Restore button for used equipment. Undo takes back any correction.
18. The Legend button explains every tile face, token and icon.

## Roadmap

Not built yet, in the order I'd do them:

- **Start everyone on the crash site.** An optional setup rule. Right now all players start together on one random tile, which is deliberate here but differs from the official game.
- **Multiplayer sync.** Today one person drives a shared screen. Syncing would send the game state (which is already one serialisable object, saved to the browser after every change) to a small realtime service, such as PartyKit, Cloudflare Durable Objects or Supabase Realtime, or go peer to peer with Trystero or PeerJS. GitHub Pages only serves static files, so this needs a backend or a peer-to-peer library, and a hosting choice to go with it.

## Feedback

Feedback is welcome, and you're free to report issues. I'll try to fix things, but I can't promise. I will only be adding features that we will need in our games online games, and will be skipping those that are minor improvements.
