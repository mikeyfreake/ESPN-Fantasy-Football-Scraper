# espn-fantasy-football
### A Node.js package for scraping data from ESPN's fantasy football leagues.

## Installation

You can install using [npm](https://www.npmjs.com/package/node-schedule).
```
npm install node-schedule
```
Include the package
```
const espnff = require('espn-fantasy-football');
```
Create a reference to a league
```
// 1829677 is the id of a league
// It can be found in the url of your fantasy clubhouse:
// ?leagueId=1829677
const league = espnff.league(1829677);
```
Trying to get info about an invalid or private league will result in rejected promises.

## Getting info about the league
The info functions return promises
```
league.getLeagueName().then(res => console.log('League name is: ' + res));
```
but right now there is only one.  Coming soon will be league information like roster size and scoring type.

## Get scores
Functions will return scoreboards, which contains information about the teams listed below
```
/**
 * @typedef Scoreboard
 * @property {string} teamName
 * @property {string} abbreviation
 * @property {string} points
 * @property {string} owners
 * @property {number} wins
 * @property {number} losses
 * @property {number} draws
 * @property {number} opponentIndex - Index of opponent within the array
 * @property {number} opponentId - Id of opponent
 * @property {number} result - 1: win, 0: draw, -1: loss
 * @property {number} teamId - A unique id for this team, consistant across weeks
 */
```

### getWeek(year, week)
```
/**
 * Gets the indicated week
 * @param {number} [year] - The year to use
 * @param {number} [week] - If not provided, gets current week's scores
 * @return {promise<Scoreboard[]|Error>} - An array containing all the
 *                                          scoreboards for that week.
 */
 
league.getWeek(2016, 8);
```
getWeek() returns an array of scoreboards, one for each team.

### getWeeks(startWeek, endWeek, year)
```
/**
 * Get scoreboards for multiple weeks
 * @param {string} startWeek - The week to start from (inclusive)
 * @param {string} endWeek - The week to end on (inclusive)
 * @param {string} [year] - The year we are working in
 * @return {promise<ScoreBoard[][]>}
 */

league.getWeeks(1, 5, 2016);
```
getWeeks() returns an array with an entry for each week in the interval.  Each week's entry is an array of scoreboards, one for each team.

### getCurrentSeason()
```
/**
 * Gets all the completed scoreboards from the current season
 * @return {promise<Scoreboard[][]|Error>}
 */
 
league.getCurrentSeason();
```
getCurrentSeason() returns an array with an entry for each week in the season so far.  Each week's entry is an array of scoreboards, one for each team.

## Contributing
1. Clone or fork the repository
2. Ensure you can use the command line command 'make' (https://github.com/bmatzelle/gow)
3. Make changes
4. Make test cases for those changes
5. Make sure your changes pass all tests (npm test)
6. Submit a pull request
