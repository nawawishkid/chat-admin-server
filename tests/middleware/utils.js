const should = require("chai").should();
const httpMocks = require("node-mocks-http");
const prefix = "[MIDDLEWARE] ";
const makeRequest = (options = null) => httpMocks.createRequest(options);
const makeResponse = (options = null) => httpMocks.createResponse(options);
/**
 * Mock express' middleware next callback
 *
 * @param {Object} obj Any object with isNext property to be altered
 */
const next = obj => () => {
  obj.isNext = true;
};
const getBody = res => {
  const data = res._getData();

  return data ? JSON.parse(data) : {};
};

module.exports = Object.freeze({
  should,
  prefix,
  next,
  getBody,
  makeRequest,
  makeResponse
});