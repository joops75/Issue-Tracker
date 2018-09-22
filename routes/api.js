/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

// var expect = require('chai').expect;
// var MongoClient = require('mongodb');
// var ObjectId = require('mongodb').ObjectID;

// const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

const IssueController = require('../controllers/issueController');

module.exports = function (app) {

  const issueController = new IssueController();

  app.route('/api/issues/:project')
  
    .get(issueController.getIssues)
    
    .post(issueController.postIssue)
    
    .put(issueController.putIssue)
    
    .delete(issueController.deleteIssue);
    
};
