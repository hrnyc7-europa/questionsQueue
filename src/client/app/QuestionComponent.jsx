import React from 'react';

// material-ui
import FlatButton from 'material-ui/FlatButton';
import Paper from 'material-ui/Paper';

import QuestionVoteComponent from './QuestionVoteComponent.jsx';
import QuestionMenuComponent from './QuestionMenuComponent.jsx';
import QuestionAdminComponent from './QuestionAdminComponent.jsx';
 
function QuestionComponent({ user, question, handlers }) {

  var isAdmin = user.role === 'admin';
  var isAuthor = user.username == question.username;
  var answeredBadge = question.answered ? <span className="question-badge answered">Answered</span> : null;
  var authorMessage = isAdmin || isAuthor ? `by ${question.username}` : '';

  return (
    <Paper>
      <div className="question-wrapper">
        <QuestionAdminComponent question={question} user={user} handlers={handlers}/>
        <div className="question-header-container">
          <div className="question-header">
            <div className="question-text">
              {question.questionText.split('\n').map(function(line, idx) {
                return <p key={idx}>{line}<br/></p>
              })}
            </div>
            <div className="question-info">
              <QuestionVoteComponent question={question} user={user} handlers={handlers}/>
            </div>
          </div>
          <p className="question-created">{`${moment(question.createdAt).fromNow()} ${authorMessage}`}</p>
          {answeredBadge}
          <div className="question-tags">
            {question.tags.map(function(tag, idx) {
              return <span key={idx} className="question-badge">{tag}</span>
            })}
          </div>
        </div>
        <QuestionMenuComponent question={question} user={user} handlers={handlers}/>
      </div>
    </Paper>  
  );
};

export default QuestionComponent;
