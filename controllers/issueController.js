const Project = require('../models/Project');
const Issue = require('../models/Issue');

const updateBuilder = (obj) => {
    let updateObj = {};
    Object.keys(obj).forEach(key => {
        if (key !== '_id' && obj[key]) updateObj[key] = obj[key];
    });
    return updateObj;
}

const queryBuilder = (obj) => {
    // { age: { $eq: 21 } } // example query
    let updateObj = {};
    Object.keys(obj).forEach(key => {
        updateObj[key] = { $eq: obj[key] };
    });
    return updateObj;
}

module.exports = class {
    postIssue(req, res) {
        const { project } = req.params;
        const { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;
        if (!issue_title || !issue_text || !created_by) return res.send('missing inputs');
        Issue.create({ project, issue_title, issue_text, created_by, assigned_to, status_text }, (err, doc) => {
            if (err) throw err;
            Project.findOneAndUpdate({ project }, { $push: { issues: doc } }, { upsert: true, new: true }, err => {
                if (err) throw err;
                res.send(doc);
            })
        });
    }

    putIssue(req, res) {
        const { _id } = req.body;
        const update = updateBuilder(req.body);
        if (Object.keys(update).length === 0) return res.send('no updated field sent');
        Issue.findByIdAndUpdate(_id, { ...update, updated_on: new Date() }, (err, doc) => {
            if (err || !doc) return res.send('could not update ' + _id);
            res.send('successfully updated');
        })
    }
    
    deleteIssue(req, res) {
        const { project } = req.params;
        const { _id  } = req.body;
        if (!_id) return res.send('_id error');
        Issue.findByIdAndRemove(_id, (err, doc) => {
            if (err || !doc) return res.send('could not delete ' + _id);
            Project.findOneAndUpdate({ project }, { $pull: { issues: _id } }, err => {
                if (err) throw err;
                res.send('deleted ' + _id);
            })
        });
    }

    getIssues(req, res) {
        const { project } = req.params;
        const query = queryBuilder(req.query);
        Project.findOne({ project })
            .populate({
                path: 'issues',
                match: query
            })
            .then(doc => { res.send(doc.issues) })
            .catch(() => res.send([]));
    }
}