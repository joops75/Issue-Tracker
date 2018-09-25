/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const mongoose = require('mongoose');
const Browser = require('zombie');
require('dotenv').config();


Browser.site = process.env.HOME_PAGE;
const Issue = mongoose.model('Issue');
chai.use(chaiHttp);

let browser;
let _id;

describe('Functional Tests', function() {
  before(done => {
    browser = new Browser();
    const deleteDataBasePromise = mongoose.connection.dropDatabase();
    const browserSetupPromise = browser.visit('/');
    Promise.all([deleteDataBasePromise, browserSetupPromise])
      .then(() => done())
      .catch(err => { throw err; });
  });
  
    describe('POST /api/issues/{project} => object with issue data', function() {
      
      it('Every field filled in', function(done) {
       chai.request(server)
        .post('/api/issues/apitest')
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Every field filled in',
          assigned_to: 'Chai and Mocha',
          status_text: 'In QA'
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, 'Title');
          assert.equal(res.body.issue_text, 'text');
          assert.equal(res.body.created_by, 'Functional Test - Every field filled in');
          assert.equal(res.body.assigned_to, 'Chai and Mocha');
          assert.equal(res.body.status_text, 'In QA');
          assert.isString(res.body.created_on);
          assert.isString(res.body.updated_on);
          assert.isTrue(res.body.open);
          assert.equal(res.body.project, 'apitest');
          _id = res.body._id;
          done();
        });
      });
      
      it('Required fields filled in', function(done) {
        chai.request(server)
          .post('/api/issues/apitest')
          .send({
            issue_title: 'My title',
            issue_text: 'Awesome issue',
            created_by: 'Mr Jim Boyd'
          })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.body.issue_title, 'My title');
            assert.equal(res.body.issue_text, 'Awesome issue');
            assert.equal(res.body.assigned_to, '');
            assert.equal(res.body.status_text, '');
            done();
          })
      });
      
      it('Missing required fields', function(done) {
        chai.request(server)
          .post('/api/issues/apitest')
          .send({
            issue_title: 'New issue',
            issue_text: 'A big issue indeed'
          })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'missing inputs');
            done();
          });
      });
      
    });
    
    describe('PUT /api/issues/{project} => text', function() {
      
      it('No body', function(done) {
        const submitButton = browser.evaluate('document.getElementsByTagName("button")[1]');
        const idInput = browser.evaluate('document.getElementsByTagName("input")[4]');
        browser.fill(idInput, _id);
        browser.pressButton(submitButton, () => {
            browser.assert.success();
            browser.assert.text('code#jsonResult', '"no updated field sent"');
            done();
          });
      });
      
      it('One field to update', function(done) {
        const submitButton = browser.evaluate('document.getElementsByTagName("button")[1]');
        const idInput = browser.evaluate('document.getElementsByTagName("input")[4]');
        const titleInput = browser.evaluate('document.getElementsByTagName("input")[5]');
        browser.fill(idInput, _id);
        browser.fill(titleInput, 'New title');
        browser.pressButton(submitButton, () => {
            browser.assert.success();
            browser.assert.text('code#jsonResult', '"successfully updated"');
            done();
          });
      });
      
      it('Multiple fields to update', function(done) {
        chai.request(server)
          .put('/api/issues/apitest')
          .send({
            _id,
            issue_title: 'Even newer title',
            issue_text: 'Newly revised',
            created_by: 'a',
            assigned_to: 'b',
            status_text: 'c',
            open: 'false'
          })
          .end((err, res) => {
            Issue.findById(_id, (err, doc) => {
              if (err) throw err;
              assert.equal(doc.issue_title, 'Even newer title');
              assert.equal(doc.issue_text, 'Newly revised');
              assert.equal(doc.created_by, 'a');
              assert.equal(doc.assigned_to, 'b');
              assert.equal(doc.status_text, 'c');
              assert.isFalse(doc.open);
              done();
            })
          })
      });
      
    });
    
    describe('GET /api/issues/{project} => Array of objects with issue data', function() {

      before(done => {
        chai.request(server)
          .post('/api/issues/apitest')
          .send({
            issue_title: 'Great title',
            issue_text: 'Some more text',
            created_by: 'a',
            project: 'apitest'
          })
          .end(() => {
            done();
          })
      })
      
      it('No filter', function(done) {
        chai.request(server)
        .get('/api/issues/apitest')
        .query({})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');
          done();
        });
      });
      
      it('One filter', function(done) {
        chai.request(server)
          .get('/api/issues/apitest')
          .query({ issue_text: 'Newly revised' })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.body[0].issue_title, 'Even newer title');
            assert.equal(res.body[0].created_by, 'a');
            assert.equal(res.body[0].assigned_to, 'b');
            assert.equal(res.body[0].status_text, 'c');
            assert.isFalse(res.body[0].open);
            assert.equal(res.body[0].project, 'apitest');
            assert.property(res.body[0], '_id');
            assert.property(res.body[0], 'created_on');
            assert.property(res.body[0], 'updated_on');
            done();
          });
      });
      
      it('Multiple filters (test for multiple fields you know will be in the db for a return)', function(done) {
        chai.request(server)
          .get('/api/issues/apitest')
          .query({
            created_by: 'a',
            open: 'true'
          })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.equal(res.body.length, 1);
            assert.equal(res.body[0].issue_title, 'Great title');
            done();
          });
      });
      
    });
    
    describe('DELETE /api/issues/{project} => text', function() {

      beforeEach(() => {
        return browser.visit('/apitest/');
      })
      
      it('No _id', function(done) {
        chai.request(server)
          .del('/api/issues/apitest')
          .send({})
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, '_id error');
            done();
          });
      });
      
      it('Valid _id', function(done) {
        chai.request(server)
          .del('/api/issues/apitest')
          .send({ _id })
          .end((err, res) => {
            assert.equal(res.status, 200);
            Issue.find({}, (err, docs) => {
              if (err) throw err;
              assert.equal(docs.length, 2);
              Issue.findById(_id, (err, doc) => {
                if (err) throw err;
                assert.isNull(doc);
                done();
              })
            })
          });
      });
      
    });

});
