const request = require('request');
const cheerio = require('cheerio');
const scoreboardUrl = 'http://games.espn.com/ffl/scoreboard';

/**
 * Gets a league object with the leagueId set
 * @param {number} leagueId
 * @return {object} league - Leagueobject
 */
module.exports.league = function(leagueId) {
  if(typeof leagueId != 'number'){
    throw new Error('Invalid leagueId');
  }

  const newLeague = {
    _id: leagueId,
    getLeagueName: getLeagueName,
    getWeekScoreboard: getWeekScoreboard,
    getCurrentSeasonScoreboards: getCurrentSeasonScoreboards
  };

  return newLeague;
}

/**
 * Gets the league name from a league object
 * @return {promise}
 */
function getLeagueName(){
  // TODO: Make other queries set this, and check if it has been set
  const queries = {leagueId: this._id};
  const options = {url: scoreboardUrl, qs: queries};
  return new Promise((resolve, reject) => {
    request(options, (err, resp, body) => {
      if(err){
        reject(err);
        return;
      }else if(resp.statusCode != 200){
        reject(Error('Status code: ' + resp.statusCode));
        return;
      }
      const $ = cheerio.load(body);
      const title = $('head > title').text();
      if(!title.includes(' Scoreboard: ')){
        if(title.substring(0, 7) == 'Error -'){
          reject(Error('Not a valid league'));
          return;
        }else if(title.substring(0, 8) == 'Log In -'){
          reject(Error('The league is private'));
          return;
        }else{
          reject(Error('League page title format was bad'));
          return;
        }
      }

      const leagueName = title.slice(0, title.indexOf('Scoreboard:')-1);
      resolve(leagueName);
    });
  });
}

/**
 * @typedef Scoreboard
 * @property {string} teamname
 * @property {string} abbreviation
 * @property {string} points
 * @property {string} owners
 * @property {number} wins
 * @property {number} losses
 * @property {number} draws
 * @property {number} opponent - Index of opponent within the array
 * @property {number} result - 1: win, 0: draw, -1: loss
 */

/**
 * Gets the indicated week
 * @param {number} season 
 * @param {number} [week] - If not provided, gets current week's scores
 * @return {promise<Scoreboard|Error>}
 */
function getWeekScoreboard(season, week){
  const queries = {leagueId: this._id, seasonId: season};
  if(week != undefined) queries.matchupPeriodId = week;
  const options = {url: scoreboardUrl, qs: queries};
  return new Promise((resolve, reject) => {
    request(options, (err, resp, body) => {
      if(err){
        reject(err);
        return;
      }else if(resp.statusCode != 200){
        reject(Error('Status code: ' + resp.statusCode));
        return;
      }
      const $ = cheerio.load(body);

      const scoreboardTable = $('#scoreboardMatchups > div > table');

      const matchups = $(scoreboardTable).find('.ptsBased');
      
      const teams = matchups.find('.team');

      const scores = [];
      teams.each((i, elem) => {
        const score = {};
        score.teamName = $(elem).find('.name').find('a').text();
        score.abbreviation = $(elem).find('.name').find('.abbrev').text();
        score.points = $(elem).next('.score').text();
        const recordSplit = $(elem).find('.record').text().split('-');
        score.wins = parseInt(recordSplit[0].slice(1));
        score.losses = parseInt(recordSplit[1]);
        score.draws = parseInt(recordSplit[2]);
        score.owners = $(elem).find('.owners').text();
        scores.push(score);
      });

      const weeksText = $('.games-pageheader').text();
      scores.week = weeksText.slice(weeksText.indexOf('Week ')+5, weeksText.length);

      scores.forEach((e, i, arr) => e.opponent = (i%2 === 0) ? i+1 : i-1);
      scores.forEach((e, i, arr) => {
        const diff = e.points - arr[e.opponent].points;
        if(diff > 0){
          e.result = 1;
        }else if(diff < 0){
          e.result = 0;
        }else{
          e.result = -1;
        }
      });

      resolve(scores);
    });
  });
}

/**
 * Gets all the completed scoreboards from the current season
 * @return {promise<Scoreboard[]|Error>}
 */
function getCurrentSeasonScoreboards(){
  // TODO: Figure where error is getting swallowed
  const year = 2016; // TODO: Get this programmatically
  const season = [];
  console.log('1');
  return new Promise((resolve, reject) =>  {
    this.getWeekScoreboard(year)
      .then(res => {
        season[res.week] = res;
        return Promise.all(getPastWeeksFrom.bind(this)(res.week, year, season));
      })
      .then(res => {
        console.log('2');
        season.splice(0,1); // Remove the 0th week
        resolve(season);
      })
  });
}

/**
 * Gets the promises for every scoreboard before the one provided
 * Must be bound to the calling object
 * @param {string} startWeek - The week to working back from
 * @param {string} year - The year we are working in
 * @param {string} season - The array that holds the season scoreboards
 * @return {promise[]}
 */
function getPastWeeksFrom(startWeek, year, season){
  const promises = [];
  for(let i = startWeek-1; i>0; i--){
    let p = this.getWeekScoreboard(year, i).then(res => {
      season[res.week] = res;
    });
    promises.push(p);
  }
  return promises;
}