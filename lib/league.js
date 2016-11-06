const request = require('request');
const cheerio = require('cheerio');

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
    getLeagueName: getLeagueName
  };

  return newLeague;
}

/**
 * Gets the league name from a league object
 * The league name is cached after the first call
 * @return {promise} Fufilled when team name is found 
 */
function getLeagueName(){
  if(this.leagueName === undefined){
    return new Promise((resolve, reject) => {
      request(scoreboardUrl(this._id), (err, resp, body) => {
        if(err){
          reject(err);
        }else if(resp.statusCode != 200){
          reject(Error('Status code: ' + resp.statusCode));
        }
        let $ = cheerio.load(body);
        let title = $('head > title').text();
        if(!title.includes(' Scoreboard: ')){
          if(title.substring(0, 7) == 'Error -'){
            reject(Error('Not a valid league'));
          }else if(title.substring(0, 8) == 'Log In -'){
            reject(Error('The league is private'));
          }else{
            reject(Error('League page title format was bad'));
          }
        }

        let leagueName = title.slice(0, title.indexOf('Scoreboard:')-1);
        this.leagueName = leagueName;
        resolve(leagueName);
      });
    });
  }else{
    return this.leagueName;
  }
}

/**
 * Gets the URL for a league scoreboard
 * @param {number} leagueId
 * @param {number} [seasonId] - (eg. 2016)
 * @return {string} URL
 */
function scoreboardUrl(leagueId, seasonId){
  if(seasonId === undefined){
    return 'http://games.espn.com/ffl/scoreboard?leagueId='+leagueId;
  }else{
    return 'http://games.espn.com/ffl/scoreboard?leagueId='+leagueId+'&seasonId='+seasonId;
  }
}

const league = module.exports.league(1829677);
console.log(league.getLeagueName());
console.log(league.getLeagueName());
setTimeout(function () {
  console.log(league.getLeagueName());
}, 5000)
//timeGetLeagueName(0, league);
function timeGetLeagueName(i, l){
  console.log(l);
  let start = new Date().getTime();
  league.getLeagueName().then((result) => {
    let end = new Date().getTime();
    let time = end - start;
    console.log('time '+i+': ', time);
    if(i > 10) return;
    timeGetLeagueName(i+1);
  }), () => {};
}