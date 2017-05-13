import React from 'react';
import EditQuestionButton from './EditQuestionButton.jsx';
import CodeZone from './CodeZone.jsx';

class QuestionMenuComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showCode: false,
      showAnswer: props.question.answered
    }

    this.closeCodeEditor = this.closeCodeEditor.bind(this);
    this.closeAnswerCodeEditor = this.closeAnswerCodeEditor.bind(this);
    this.toogleAnswerCode = this.toogleAnswerCode.bind(this);
    this.showAnswerCodeEditor = this.showAnswerCodeEditor.bind(this);

    this.answerZone = null;
  }

  toogleCode() {
    var current = this.state.showCode;
    this.setState({ showCode: !current })
  }

  closeCodeEditor() {
    this.setState({ showCode: false })
  }

  toogleAnswerCode() {
    var current = this.state.showAnswer;
    this.setState({ showAnswer: !current })
  }

  closeAnswerCodeEditor() {
    this.setState({ showAnswer: false })
  }

  showAnswerCodeEditor() {
    this.setState({ showAnswer: true })
  }

  componentWillReceiveProps(nextProps) {
    //console.log('received', nextProps.question);
    if(!nextProps.question.answered) {
      this.closeAnswerCodeEditor();
    }
  }


  render() {

    var question = this.props.question;
    var user = this.props.user;
    var handlers = this.props.handlers;

    var isAdmin = user.role === 'admin';
    var isAuthor = user.username == question.username;

    var codeEditorButton = <button key={1} disabled={!question.codeSnippet} className="question-button no-border-left" onClick={() => this.toogleCode()}>{this.state.showCode ? 'Close Code' : 'Open Code'}</button>;
    var answerButton = (<button key={2} disabled={!isAdmin && !question.answered} className="question-button" onClick={() => { if(isAdmin) handlers.answer(question); if(isAdmin) this.showAnswerCodeEditor(); else this.toogleAnswerCode(); }}>{(question.answered && isAdmin) ? ' Hide Answer' : 'Answer'}</button>);
    var editButton = (<EditQuestionButton showAnswerCodeEditor={this.showAnswerCodeEditor} closeAnswerCodeEditor={this.closeAnswerCodeEditor} toogleAnswerCode={this.toogleAnswerCode} openCodeEditor={this.openCodeEditor} closeCodeEditor={this.closeCodeEditor} isAdmin={isAdmin} isAuthor={isAuthor} key={3} question={question} handlers={handlers}/>);
    var deleteButton = (<button key={4} disabled={!isAdmin} className="question-button" onClick={() => handlers.delete(question)}>Delete</button>);

    var codeZone = this.state.showCode ? (
      <CodeZone
        codeSnippet={question.codeSnippet}
        readOnly="true"
      />
    ) : null;

    this.answerZone = this.state.showAnswer || (!isAdmin && question.answered) ? (
      <div>
        <div className="question-code-header"> Instructor Answer </div>
        <CodeZone
          codeSnippet={question.answer}
          readOnly="true"
        />
      </div>
    ) : null;

    return (
      <div>
        <div className="question-code-container" style={{display: this.state.showCode ? 'block' : 'none'}}>
          <div className="question-code-header"> Question Code </div>
          {codeZone}
        </div>
        <div className="question-code-container" style={{display: this.state.showAnswer ? 'block' : 'none'}}>
          {this.answerZone}
        </div>
        <div className="question-buttons">
          {[codeEditorButton, answerButton, editButton, deleteButton]}
        </div>
      </div>
    )
  }
}

export default QuestionMenuComponent;
