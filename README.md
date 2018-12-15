# LIRI Bot

### Overview

LIRI is like iPhone's SIRI. However, while SIRI is a Speech Interpretation and Recognition Interface, LIRI is a _Language_ Interpretation and Recognition Interface. LIRI will be a command line node app that takes in parameters and gives you back data.

### Description

LIRI understands and reponds to the following four commands:
  1) concert-this
  2) spotify-this-song
  3) movie-this
  4) do-what-it-says

#### Usages and Outputs (requirements)

1. `node liri.js concert-this <artist/band name>`
  * This will search the Bands in Town Artist Events API for an artist
    and render the following information about each event to the terminal:
   * Name of the venue
   * Venue location
   * Date of the Event ("MM/DD/YYYY")

2. `node liri.js spotify-this-song <song name>`
  * This will show the following information about the song in terminal.
   * Artist(s)
   * The song's name
   * A preview link of the song from Spotify
   * The album that the song is from
   * If no song is provided then your program will default to "The Sign" by Ace of Base.

3. `node liri.js movie-this <movie name>`
  * This will output the following information to your terminal/bash window:
    * Title of the movie.
    * Year the movie came out.
    * IMDB Rating of the movie.
    * Rotten Tomatoes Rating of the movie.
    * Country where the movie was produced.
    * Language of the movie.
    * Plot of the movie.
    * Actors in the movie.
  * If the user doesn't type a movie in, the program will output data for the movie 'Mr. Nobody.'

4. `node liri.js do-what-it-says`
  * LIRI will take the text inside of random.txt and then use it to call one of LIRI's commands.
  * Multiple LIRI commands can be listed one command per line.

### Files
```
.gitignore                -- GIT ignore file
README.md                 -- this file
homework_instructions.md  -- original requirements and instructions
keys.js                   -- API keys through doenv module
liri.js                   -- main app javascript
package.json              -- npm package file
random.txt                -- sample input file for "do-what-it-says"
```
