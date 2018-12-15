/*
  LIRI BOT -- node.js command-line API broker

  LIRI understands and reponds to the following four commands:
   1) concert-this
   2) spotify-this-song
   3) movie-this
   4) do-what-it-says

  == Usages and Outputs (requirements) ==
  1. node liri.js concert-this <artist/band name>
    * This will search the Bands in Town Artist Events API
      (`"https://rest.bandsintown.com/artists/" + artist + "/events?app_id=codingbootcamp"`)
      for an artist and render the following information about each event to the terminal:
    * Name of the venue
    * Venue location
    * Date of the Event (use moment to format this as "MM/DD/YYYY")

  2. node liri.js spotify-this-song <song name>
    * This will show the following information about the song in your terminal/bash window
    * Artist(s)
    * The song's name
    * A preview link of the song from Spotify
    * The album that the song is from
    * If no song is provided then your program will default to "The Sign" by Ace of Base.

  3. node liri.js movie-this <movie name>
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

  4. node liri.js do-what-it-says
    * Using the `fs` Node package, LIRI will take the text inside of random.txt and then use it to call one of LIRI's commands.
    * It should run `spotify-this-song` for "I Want it That Way," as follows the text in `random.txt`.
*/

"use strict";

// Get API keys ready
require("dotenv").config();
const KEYS = require("./keys");

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

//
// LIRI BOT class -- node.js command-line API broker
//
class Liri {
  constructor() {
    this.command = "";   // command
    this.cmdArgs = [];   // the rest of command-line arguments
    this.inputFile = "./random.txt"; // for do-what-it-says
  }

  usage() {
    console.log("USAGE: node liri.js <command> [param]\n");
    console.log("Available <command>s are:\n"
                + "\t* concert-this <artist or band>\n"
                + "\t* spotify-this-song <song name>\n"
                + "\t* movie-this <movie name>\n"
                + "\t* do-what-it-says\n"
                );
    return true;
  }

  //
  // Do the job
  //
  doIt() {
    if (this.procCmdLine()) {
      this.runCmd();
    }
    else {
      this.usage();
    }
  }

  //
  // Process the command-line arguments
  //
  procCmdLine() {
    this.command = process.argv[2];
    this.cmdArgs = process.argv.slice(3);

    return true;
  }

  //
  // Identify the command/request and run the appropriate API
  //
  runCmd() {
    switch(this.command) {
      case "concert-this":
        this.concertThis();
        break;
      case "spotify-this-song":
        this.spotifyThisSong();
        break;
      case "movie-this":
        this.movieThis();
        break;
      case "do-what-it-says":
        this.doWhatItSays();
        break;
      case undefined:
        this.usage();
        return false;
      default:
        console.log(`Unable to understand the command "${this.command}"\n`);
        this.usage();
        return false;
    }

    return true;
  }

  //
  // Respond to "concert-this" with BandsInTown API
  //
  concertThis() {
    const bandsInTown = new BandsInTown(KEYS.bandsintown);
    const artistName = this.cmdArgs.join(" ");
    bandsInTown.findConcert(artistName);
  }

  //
  // Respond to "spotify-this-song" with Spotify API
  //
  spotifyThisSong() {
    const spotify = new SpotifyAPI(KEYS.spotify);
    let songName = "The Sign Ace of Base";

    if (this.cmdArgs.length > 0) {
      songName = this.cmdArgs.join(" ");
    }
    spotify.searchSong(songName);
  }

  //
  // Respond to "movie-this" with OMDb API
  //
  movieThis() {
    const omdb = new OMDbAPI(KEYS.omdb);
    let movieName = "Mr. Nobody";

    if (this.cmdArgs.length > 0) {
      movieName = this.cmdArgs.join(" ");
    }
    omdb.findMovie(movieName);
  }

  //
  // Respond to "do-what-it-says"
  //
  doWhatItSays() {
    const fs = require('fs');
    let lines;

    console.log(`Reading ${this.inputFile} ...`)
    fs.readFile(this.inputFile, 'utf8', (error, content) => {
      if (error) {
        console.log(error);
        return;
      }

      lines = content.split("\n");
      console.log(lines);
      this.runCmdsPerWhatItSays(lines);
    });
  }

  //
  // A helper function for doWhatItSays()
  //
  // PARAMS:
  // * lines = an array of commands on each line from a file
  //
  runCmdsPerWhatItSays(lines) {
    for (let i = 0; i < lines.length; i++) {
      let items = lines[i].split(',');

      if (/-/.test(items[0])) {
        console.log(`\nIt says, ${items.join(' ')}, on line ${i+1}`);

        this.command = items[0];
        this.cmdArgs = items.slice(1);
        this.runCmd();
      }
    }
  }
}

//
// BandsInTown
//
// 1. node liri.js concert-this <artist/band name>
//   * This will search the Bands in Town Artist Events API for an artist
//     and render the following information about each event.
//    * Name of the venue
//    * Venue location
//    * Date of the Event (use moment to format this as "MM/DD/YYYY")
//
class BandsInTown {
  //
  // PARAM:
  // * key = API key expanded by dotenv in keys.js
  //
  constructor(key) {
    this.key = Object.entries(key)[0].join('=');
    this.request = require("request");
    this.moment = require("moment");
    this.maxEvents = 5;
  }

  //
  // Find conerts for "artistName"
  //
  // PARAMS:
  // * artistName = a name of artist or band
  // * maxEvents = the maximum number of events to list
  //
  findConcert(artistName, maxEvents = this.maxEvents) {
    let query = "https://rest.bandsintown.com/artists/" 
                + artistName + "/events?" + this.key;

    console.log(`\n=======\nFinding concerts for "${artistName}"`);
    this.request(query, (error, response, body) => {
      if (error) {
        console.log("ERROR: ", error);
        return;
      }
      const jsonObj = this.body2JSON(body);
      if (!jsonObj) return;

      console.log(`\n=======\nResult for "${artistName}" concerts`);
      this.printConcertInfo(jsonObj, maxEvents);
    });
  }

  //
  // Convert returned body from "request" to JSON
  //
  // RETURN:
  // * JSON, if successful
  // * null, otherwise
  //
  body2JSON(body) {
    const data = JSON.parse(body);
    // console.log(body);

    if (data.length === 0) {
      console.log("The artist not found.");
      return null;
    }
    if ('errorMessage' in data) {
      console.log(data.errorMessage);
      return null;
    }
    if ('message' in data) {
      console.log(data.message);
      return null;
    }

    return data;
  }

  //
  // Facilitator function for findConcert to display the result
  //
  // PARAMS:
  // * body = returned data body parameter from calling "request"
  // * maxEvents = the maximum number of events to list
  //
  printConcertInfo(data, maxEvents = this.maxEvents) {
    // let data = JSON.parse(body);
    // console.log(data);

    for (let i = 0; i < data.length && i < maxEvents; i++ ) {
      let element = data[i];
      let venue = element.venue;
      let location = [venue.city, venue.region, venue.country
                      ].filter(e => e.length > 0).join(", ");
      let date = this.moment(element.datetime).format("MM/DD/YYYY");

      console.log("- " + (i + 1) + " -");
      console.log(`\tVenue: ${venue.name}`);
      console.log(`\tLocation: ${location}`);
      console.log(`\tDate: ${date}`);
    }
  }
}


//
// Spotify
//
// 2. node liri.js spotify-this-song <song name>
//   * This will show the following information about the song
//     * Artist(s)
//     * The song's name
//     * A preview link of the song from Spotify
//     * The album that the song is from
//   * If no song is provided then default to "The Sign" by Ace of Base.
//
class SpotifyAPI {
  //
  // PARAM:
  // * key = API key expanded by dotenv in keys.js
  //
  constructor(key) {
    let Spotify = require('node-spotify-api');
    this.api = new Spotify(key);
  }

  //
  // Search the "song" on Spotify
  //
  // PARAMs:
  // * song = a name of song
  //
  searchSong(song = "The Sign") {
    let params = {
      type: 'track',
      query: song,
      limit: 5
     }

    console.log(`\n=======\nSearching for the song "${song}"`);
    this.api.search(params, function(err, data) {
      if (err) {
        console.log('Error occurred: ' + err);
        return;
      }
      else if (data.tracks.items.length === 0) {
        console.log("No song found.");
        return;
      }
      // console.log(data);

      console.log(`\n=======\nSeach result for the song "${song}"`);
      let items = data.tracks.items;
      for (let i = 0; i < items.length; i++ ) {
        let artist = items[i].artists.map(a => a.name).join(", ");
        let songName = items[i].name;
        let link = items[i].external_urls.spotify;
        let album = items[i].album.name;

        console.log("- " + (i + 1) + " -");
        console.log(`\tArtist(s): ${artist}`);
        console.log(`\tSong Name: ${songName}`);
        console.log(`\tLink: ${link}`);
        console.log(`\tAlbum: ${album}`);
      }
    });
  }
}


//
// OMDb
//
// 3. node liri.js movie-this <movie name>
//   * This will output the following information to your terminal/bash window:
//     * Title of the movie.
//     * Year the movie came out.
//     * IMDB Rating of the movie.
//     * Rotten Tomatoes Rating of the movie.
//     * Country where the movie was produced.
//     * Language of the movie.
//     * Plot of the movie.
//     * Actors in the movie.
//   * If the user doesn't type a movie in, the program will output data for the movie 'Mr. Nobody.'
class OMDbAPI {
  //
  // PARAM:
  // * key = API key expanded by dotenv in keys.js
  //
  constructor(key) {
    this.key = Object.entries(key)[0].join('=');
    this.request = require("request");
  }

  //
  // Find conerts for "artistName"
  //
  // PARAMS:
  // * movieName = a name of movie
  //
  findMovie(movieName = "Mr. Nobody") {
    let query = [
      'http://www.omdbapi.com/?',
      this.key,
      `t=${movieName}`,
      'page=3',
      'type=movie',
      'r=json'
    ].join('&');

    console.log(`\n=======\nFinding the movie "${movieName}"`);
    this.request(query, (error, response, body) => {
      if (error) {
        console.log("ERROR: ", error);
        return;
      }

      const jsonObj = this.body2JSON(body);
      if (!jsonObj) return;

      console.log(`\n=======\nResult for the movie "${movieName}"`);
      this.printMovieInfo(jsonObj);
    });
  }

  //
  // Convert returned body from "request" to JSON
  //
  // RETURN:
  // * JSON, if successful
  // * null, otherwise
  //
  body2JSON(body) {
    const data = JSON.parse(body);
    // console.log(data);
  
    if ('Error' in data) {
      console.log("Error: " + data.Error);
      return null;
    }
    return data;
  }

  //
  // Facilitator function for findMovie to display the result
  //
  // PARAMS:
  // * data = returned data from calling "request" in JSON format
  //
  // Output the followings to the screen/terminal:
  //     * Title of the movie.
  //     * Year the movie came out.
  //     * IMDB Rating of the movie.
  //     * Rotten Tomatoes Rating of the movie.
  //     * Country where the movie was produced.
  //     * Language of the movie.
  //     * Plot of the movie.
  //     * Actors in the movie.
  //
  printMovieInfo(data) {
    const rottenTomatoes = this.rottenTomatoesRating(data);
    const output = [
      `Title:    ${data.Title}`,
      `Year:     ${data.Year}`,
      `Rating:   IMDb ${data.imdbRating}`,
      `          Rotten Tomatoes ${rottenTomatoes}`,
      `Country:  ${data.Country}`,
      `Language: ${data.Language}`,
      `Plot:     ${data.Plot}`,
      `Actors:   ${data.Actors}`
    ];

    console.log(output.join("\n"));
  }

  //
  // Facilitator function for printMovieInfo to get a rating by
  // RottenTomatoes
  //
  // PARAMS:
  // * data = returned data from calling "request" in JSON format
  //
  // RETURN:
  // * Rating value by RottenTomatoes
  //
  rottenTomatoesRating(data) {
    let rottenTomatoes = "(unavailable)";

    if ('Ratings' in data) {
      let rtRating = data.Ratings.filter(rating =>
        rating.Source === 'Rotten Tomatoes'
      );
      // console.log(rtRaiting);

      if (rtRating.length === 1) {
        rottenTomatoes = rtRating.shift().Value;
      }
    }

    return rottenTomatoes;
  }
}


// . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 
//  MAIN
// . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 

const liri = new Liri();

liri.doIt();

