'use strict';
const league = require('./lib/league.js');
/**
 * Gets a league object with the leagueId set
 * @param {number} leagueId
 * @return {object}
 */
module.exports.league = function(leagueId) {
  return league.league(leagueId);
}