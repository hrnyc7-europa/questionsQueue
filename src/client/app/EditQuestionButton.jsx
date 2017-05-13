import React from 'react';

// material-ui
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';

import QuestionFormComponent from './QuestionFormComponent.jsx';

class EditQuestionButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      enableButton: props.isAdmin || props.isAuthor,
      open: false
    };
    this.handleOpen = this.handleOpen.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
  }
  handleOpen() {
    this.setState({ open: true });
  }
  handleClose() {
    this.setState({ open: false });
  }
  handleEdit(question) {
    this.props.handlers.edit(question);
    this.props.showAnswerCodeEditor();
    this.handleClose();
  }
  render() {
    //console.log(this.props.isAdmin, this.props.isAuthor);
    return (
      <span className="question-flex-1" style={{width:'100%',display:'inline-block'}}>
        <button
          disabled={!this.state.enableButton}
          className="question-button"
          onClick={() => {
            this.handleOpen();
            this.props.closeCodeEditor();
            this.props.closeAnswerCodeEditor();
          }}>
        Edit</button>
        <Dialog
          title="Edit Question"
          modal={false}
          open={this.state.open}
          onRequestClose={this.handleClose}
          autoScrollBodyContent={true}
          >
          <QuestionFormComponent
            question={this.props.question}
            handleEdit={this.handleEdit}
            isAdmin={this.props.isAdmin}/>
          <RaisedButton style={{width: '93%', margin: '3.5%'}} onClick={this.handleClose} label="BACK TO QUESTIONS" />
        </Dialog>
      </span>
    );
  }
}

export default EditQuestionButton;
