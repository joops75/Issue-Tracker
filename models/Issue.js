const mongoose = require('mongoose');
const { Schema } = mongoose;

const IssueSchema = new Schema({
    project: String,
    issue_title: { type: String, default: '' },
    issue_text: { type: String, default: '' },
    created_by: { type: String, default: '' },
    assigned_to: { type: String, default: '' },
    status_text: { type: String, default: '' },
    created_on: { type: Date, default: new Date() },
    updated_on: { type: Date, default: new Date() },
    open: { type: Boolean, default: true }
});

module.exports = mongoose.model('Issue', IssueSchema);