const db = require('./db-config');
const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: String,
  codeSnippet: String,
  votes: Number,
  keep: {type:Boolean, default: false},
  answered: Boolean,
  createdAt: { type: Number, default: Date.now() },
  tags: Array,
  username: { type: String, required: true },
  cohort: { type: String, required: true },
  townHall: { type: Number, required: true },
  usersVoted: { type: [String], default: [] },
  answer: { type: String, default: '' },
});

// exporting the questionQueue schema with questionQueue instance
module.exports = mongoose.model('Question', questionSchema);
