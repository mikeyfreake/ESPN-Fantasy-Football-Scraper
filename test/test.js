const expect = require("chai").expect;
const espnff = require('../index.js');
const rewire = require('rewire');
const _ = require('lodash');

describe("ESPN Fantasy Football", () => {
  describe("League object tests", () => {

    describe("League object initialization", () => {
      it("should create league from number", () => {
        let league = espnff.league(1829677);
        expect(league._id).to.equal(1829677);
      });

      it("should NOT create league from string", () => {
        expect(() => espnff.league('1829677')).to.throw();
      });

      it("should NOT create league from object", () => {
        expect(() => espnff.league(new Date())).to.throw();
      });

      it("should NOT create league from nothing", () => {
        expect(() => espnff.league()).to.throw();
      });
    });

    describe("Getting league name", () => {
      it("should get the correct league name for a valid league", () => {
        let league = espnff.league(1829677);
        return league.getLeagueName().then((result) => {
          expect(result).to.equal('Miami 8-Team 1829677');
        });
      });

      it("should throw error if league is invalid", () => {
        let league = espnff.league(-1);
        return league.getLeagueName().then((result) => {
          throw new Error('Test should have failed!');
        }, () => {}); // Need to handle error otherwise mocha will fail
      });

      it("should throw a privacy error if league is private", () => {
        let league = espnff.league(1045334);
        return league.getLeagueName().then((result) => {
          throw new Error('Test should have failed!');
        }, () => {}); // Need to handle error otherwise mocha will fail
      });
    });

    describe("Getting scoreboard data", () => {
      it("Should get the current week's scores", () => {
        let league = espnff.league(1829677);
        return league.getWeek().then(res => {
          expect(_.has(res[0], 'teamName')).to.equal(true);
        });
      });


      it("Should get the current season's scores", () => {
        let league = espnff.league(1829677);
        return league.getCurrentSeason().then(res => {
          expect(_.has(res[0][0], 'teamName')).to.equal(true);
        });
      });
    });
  });
});