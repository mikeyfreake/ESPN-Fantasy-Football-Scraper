/**
 * Gets a league object with the leagueId set
 * @param {number} leagueId
 * @return {object}
 */
module.exports.league = function(leagueId) {
  if(typeof leagueId === 'string'){
    leagueId = parseInt(leagueId);
  }else if(typeof leagueId != 'number'){
    throw new Error('Invalid leagueId');
  }

  const newLeague = {
    _id: leagueId
  };

  return newLeague;
}