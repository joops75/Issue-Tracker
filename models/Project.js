const mongoose = require('mongoose');
const { Schema } = mongoose;

const ProjectSchema = new Schema({
    project: String,
    issues: [{ type: Schema.Types.ObjectId, ref: 'Issue'}]
});

module.exports = mongoose.model('Project', ProjectSchema);