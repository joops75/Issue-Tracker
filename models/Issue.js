const mongoose = require('mongoose');
const { Schema } = mongoose;

const IssueSchema = new Schema({
    project: String,
    issue_title: { type: String, required: true },
    issue_text: { type: String, required: true },
    created_by: { type: String, required: true },
    assigned_to: String,
    status_text: String,
    created_on: { type: Date, default: new Date() },
    updated_on: { type: Date, default: new Date() },
    open: { type: Boolean, default: true }
});

module.exports = mongoose.model('Issue', IssueSchema);