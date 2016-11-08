const expect = require("chai").expect;
const espnff = require('../index.js');
const rewire = require('rewire');

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
  });
});