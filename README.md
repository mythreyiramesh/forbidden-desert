## About this implementation of Forbidden Desert

Recently, our board game group has become heavily invested in finding out a way to beat this game. We love the cooperative nature of it, and thank the creator for this incredible game. This React version was created to make our board game nights easier to do over screenshare since we're not in the same city anymore. Having said that, this is literally a stand-in for the actual game, and doesn't do most of the automations that are possible in a digital game. For the real stuff, check out the official game at https://www.forbiddendesert.com.

I put together this "app" with no background of React or even JavaScript with the help of Claude (Sonnet and Haiku). So, the practices will certainly not be optimal and there are a million ways to make this better. I used Ideogram to get some of the artwork and did some fixes myself with Inkscape. I haven't bothered to include a lot of CSS to prettify the app, and there are some quirks with the gameplay as well. Read below to actually try the game out for yourself.

## How to Play

The official rules are available somewhere on https://boardgamegeek.com/boardgame/136063/forbidden-desert. I have allowed 1 and 6 player games although that's not recommended in the official game. 

### Mechanics - what is automated, what isn't

Assuming you know how to play the actual game, keep these in mind when using this web app:

1. Set up the game: no of players, choice of players and the order of play. Freeze the options and Start Game.
2. The players will all start on a random tile (the back could be a gear, or not. This is different from the actual game).
3. Players can be dragged and dropped. The web app doesn't keep track of turns or actions or legality of actions. It's up to you. You can use the order of players on the right to keep track of play order.
4. Click on sand markers to remove sand one at a time. Sand clearing action cannot be undone.
5. Adjust water levels near players to share water or gain water from wells. Gaining water isn't automatic, and if you see a lake that's a real well, the fake well is just dunes. All three will have a water emoji when unexcavated.
6. Draw storm cards equal to what is displayed on the left. The web app doesn't keep track of how many you must draw. The storm effects are applied automatically. If sun beats down, even players in tunnel lose water, so adjust it back manually.
8. Equipments must be assigned to players manually and can be used once assigned. Dune Blaster, Jet Pack, Solar Shield, Water Reserve are all up to you to keep track. Terrascope lets you peek at a tile, and the peeked tile will permanently display the description of what you'll find on excavation.
9. Once both vertical and horizontal clues have been excavated, the parts become draggable. Once you drop the part on a tile, it can't be moved. Make sure to drop it correctly. A check box appears to pick up the part if rules are met.
10. Players can not blocked from entering blocked tiles by the app, you must figure out whether you're making legal moves.
11. Storm Deck has an extra shuffle button, be careful when nearing the end of the deck and don't include shuffle as one of the storm cards.
12. Number of Sun and Storm cards left are displayed below the storm deck, so are the number of cards.
13. Meteologist being present in the game will enable "Reveal" action near storm deck. Cards equal to number to draw will be revealed, and one can be optionally sent to the bottom.
14. If one of the loss conditions or the win condition is met, an animation pops up. Some buttons will still work after animation shows. To reset, refresh the app.

## Feedback

Feedback is welcome, and you're free to report issues. I'll try to fix things, but I can't promise. I will only be adding features that we will need in our games online games, and will be skipping those that are minor improvements.
