var expect = require("chai").expect;
var espnff = require('../index.js');
describe("ESPN Fantasy Football", function() {
  it("should create league from number", function(){
    const league = espnff.league(1829677);
    expect(league._id).to.equal(1829677);
  });

  it("should create league from string", function(){
    const league = espnff.league('1829677');
    expect(league._id).to.equal(1829677);
  });

  it("should NOT create league from object", function(){
    // Arrow function otherwise it fails
    expect(() => espnff.league(new Date())).to.throw();
  });

  it("should NOT create league from nothing", function(){
    expect(() => espnff.league()).to.throw();
  });
});