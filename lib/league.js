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
    getWeek: getWeek,
    getCurrentSeason: getCurrentSeason,
    getWeeksFrom: getWeeksFrom
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
 * @property {string} teamName
 * @property {string} abbreviation
 * @property {string} points
 * @property {string} owners
 * @property {number} wins
 * @property {number} losses
 * @property {number} draws
 * @property {number} opponent - Index of opponent within the array
 * @property {number} opponentId - Id of opponent
 * @property {number} result - 1: win, 0: draw, -1: loss
 * @property {number} teamId - A unique id for this team, consistant across weeks
 */

/**
 * Gets the indicated week
 * @param {number} [year] - The year to use
 * @param {number} [week] - If not provided, gets current week's scores
 * @return {promise<Scoreboard|Error>}
 */
function getWeek(year = currentYear(), week){
  const queries = {leagueId: this._id, seasonId: year};
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
      
      const teams_data = matchups.find('.team');

      const teams = [];
      teams_data.each((i, elem) => {
        const team = {};
        team.teamName = $(elem).find('.name').find('a').text();
        team.abbreviation = $(elem).find('.name').find('.abbrev').text();
        team.points = Number($(elem).next('.score').text());
        const recordSplit = $(elem).find('.record').text().split('-');
        team.wins = parseInt(recordSplit[0].slice(1));
        team.losses = parseInt(recordSplit[1]);
        team.draws = parseInt(recordSplit[2]);
        team.owners = $(elem).find('.owners').text();
        team.teamId = $(elem).parent().attr('id').split('_')[1];
        teams.push(team);
      });
      const weeksText = $('.games-pageheader').text();
      teams.week = Number(weeksText.slice(weeksText.indexOf('Week ')+5, weeksText.length));

      teams.forEach((e, i, arr) =>{
        e.opponentIndex = (i%2 === 0) ? i+1 : i-1;
        e.opponentId = arr[e.opponentIndex].teamId;
      });
      teams.forEach((e, i, arr) => {
        const diff = e.points - arr[e.opponentIndex].points;
        if(diff > 0){
          e.result = 1;
        }else if(diff < 0){
          e.result = -1;
        }else{
          e.result = 0;
        }
      });
      resolve(teams);
    });
  });
}

/**
 * Gets all the completed scoreboards from the current season
 * @return {promise<Scoreboard[]|Error>}
 */
function getCurrentSeason(){
  // TODO: Figure where error is getting swallowed
  const year = new Date().getFullYear();
  let lastWeek = null; // Stores the initial week we get in the 1st promise
  return new Promise((resolve, reject) =>  {
    this.getWeek(year)
      .then(res => {
        lastWeek = res;
        return getWeeksFrom.bind(this)(1, res.week-1, year);
      })
      .then(res => {
        res.splice(0,1); // Remove the 0th week
        res.push(lastWeek); // Push on the first week we got
        resolve(res);
      })
  });
}

/**
 * @private
 * Gets the promises for every scoreboard before the one provided
 * Must be bound to the calling object
 * @param {string} startWeek - The week to start from (inclusive)
 * @param {string} endWeek - The week to end on (inclusive)
 * @param {string} [year] - The year we are working in
 * @return {promise[]}
 */
function getWeeksFrom(startWeek, endWeek, year = currentYear()){
  const promises = [];
  const season = [];
  for(let i = startWeek; i<=endWeek; i++){
    let p = this.getWeek(year, i);
    promises.push(p);
  }
  return Promise.all(promises);
}

function currentYear(){
  return new Date().getFullYear();
}