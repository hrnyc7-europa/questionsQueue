import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import NavBar from './navbar.component.jsx';
import Dialog from 'material-ui/Dialog';
import Paper from 'material-ui/Paper';
import {
  HashRouter as Router,
  Route,
  Link,
  Redirect,
  withRouter,
  IndexRoute
} from 'react-router-dom';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import QueueComponent from './QueueComponent.jsx';
import { remove } from 'lodash';


// Update an array of questions to include a modified question.
// Mutates array. Does not return a value.
const updateQuestions = (questions, newQ) => {
  const idx = questions.findIndex(i => i._id === newQ._id);
  questions[idx] = newQ;
};

const putRequest = (question) =>

  fetch('/api/questions', {
    credentials: 'include',
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(question),
  });


class ProfileComponent extends React.Component {
	constructor(props) {
	    super(props);

			this.state = {
					user: {
            avatarURL: 'https://heatherchristenaschmidt.files.wordpress.com/2011/09/facebook_no_profile_pic2-jpg.gif'
          },
					open: false,
				 	updatedUser: {},
					disableButton: true
				}

			document.cookie.split(';').forEach((str) => {
				const [k, v] = str.split('=').map(s => s.trim());
					if (k === 'username' || k === 'role' || k === 'cohort') {
					this.state.user[k] = v;
				} else if(k === 'img') {
					this.state.user['avatarURL'] = unescape(v);
				}
			});
			this.getCurrentUser();

			this.handleOpen = this.handleOpen.bind(this);
			this.handleClose = this.handleClose.bind(this);
			this.updateUserName = this.updateUserName.bind(this);
			this.updateUserPicture = this.updateUserPicture.bind(this);
			this.updateCurrentUser = this.updateCurrentUser.bind(this);

			this.handleVote = this.handleVote.bind(this);
		    this.handleUpvote = this.handleUpvote.bind(this);
		    this.handleDownvote = this.handleDownvote.bind(this);
		    this.handleAnswered = this.handleAnswered.bind(this);
		    this.handleDelete = this.handleDelete.bind(this);
		    this.handleEdit = this.handleEdit.bind(this);
		    this.handleTagDelete = this.handleTagDelete.bind(this);
		    this.handleKeep = this.handleKeep.bind(this);
		    this.handleUnkeep = this.handleUnkeep.bind(this);
	}

  handleVote(question, n) {
	    const q = question;
	    q.votes += n;
	    if (n === 1) {
	      q.usersVoted.push(this.state.user.username);
	    } else {
	      remove(q.usersVoted, i => i === this.state.user.username);
	    }
	    putRequest(q)
	      .then(res => res.json())
	      .then((data) => {
	        this.setState((prevState) => {
	          const questions = prevState.questions;
	          updateQuestions(questions, data);
	          return { questions };
	        });
	      })
	      .catch((err) => {
	        q.votes -= n;
	      });
	  }

	handleUpvote(question) {
	    this.handleVote(question, 1);
	  }

  handleDownvote(question) {
	    this.handleVote(question, -1);
	  }

  handleAnswered(question) {
    const q = question;
    const current = question.answered;
    q.answered = !current;
    putRequest(question)
      .then(res => res.json())
      .then((data) => {
        this.setState((prevState) => {
          const questions = prevState.questions;
          updateQuestions(questions, data);
          return { questions
          }
        });
      })
      .catch((err) => {
        q.answered = current;
      });
  }

  handleDelete(question) {
    const _id = question._id;
    fetch('/api/questions', {
      credentials: 'include',
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ _id }),
    })
    .then(() => {
      this.setState((prevState) => {
        const questions = prevState.questions;
        remove(questions, (q) => q._id === _id);
        return {
          questions
        };
      });
    });
  }

  handleEdit(question) {
    putRequest(question)
      .then(res => res.json())
      .then((data) => {
        this.setState((prevState) => {
          return {
          };
        });
      })
      .catch((err) => {
      });
  }

  handleTagDelete(tag, question) {
    const q = question;
    remove(q.tags, t => t === tag);
    putRequest(q)
      .then((res) => {
        if (res.status === 200) {
          this.setState((prevState) => {
            const questions = prevState.questions;
            updateQuestions(questions, q);
            return { questions };
          });
        }
      });
  }

  handleKeep(question) {
    question.keep = true;
    putRequest(question);
  }

  handleUnkeep(question) {
    question.keep = false;
    putRequest(question);
  }

	handleOpen() {
		this.setState({ open: true });
	}

	handleClose() {
		delete this.state.updatedUser.givenName;
		delete this.state.updatedUser.avatarURL;
		this.setState({ open: false });
	}

	getCurrentUser() {

    fetch('/api/user/' + this.state.user.username, { credentials: 'include' })
      .then((res) => {
        if (res.status === 200 || res.status === 304) {
          return res.json();
        } else if (res.status === 403) {
          return null;
        }
      })
      .then(data => {
					//console.log('data', data)
					if(data.avatarURL !== undefined) this.state.user['avatarURL'] = data.avatarURL;

					this.state.user['_id'] = data._id;
					this.state.updatedUser['_id'] = data._id;
					this.state.user['givenName'] = data.givenName;
					this.state.user['cohort'] = data.cohort;
					//console.log('state', this.state)
					this.forceUpdate();
				}
      );
  }

	checkDisabled() {
		var disabled = true;
		if(this.state.updatedUser.givenName || this.state.updatedUser.avatarURL) disabled = false;
		this.setState({ disableButton: disabled });
	}

	updateUserName(val) {
		this.state.updatedUser['givenName'] = val;
		if(this.state.updatedUser.givenName === '') delete this.state.updatedUser.givenName;
		this.checkDisabled();
		//console.log(this.state.updatedUser);
	}

	updateUserPicture(val) {
		this.state.updatedUser['avatarURL'] = val;
		if(this.state.updatedUser.avatarURL === '') delete this.state.updatedUser.avatarURL;
		this.checkDisabled();
		//console.log(this.state.updatedUser);
	}

	updateCurrentUser(user) {

		fetch('/api/user/' + this.state.username, {
	    credentials: 'include',
	    method: 'PUT',
			headers: {
	      'Content-Type': 'application/json',
	    },
	    body: JSON.stringify(user)
	  }).then(data => {
			//console.log(data)
			this.getCurrentUser();
			alert('User Updated!');
			this.handleClose();
		})
	}

	render() {

		return (
			<MuiThemeProvider>
			<div id="profile-wrapper" className="app-body">
  			<Paper className="profileContent">
          <div className="profilePicContainer">
  				    <img className="profilePic" src={this.state.user.avatarURL}/>
              <RaisedButton onClick={this.handleOpen} label="Edit Profile"/>
          </div>
          <div className="profileInfo">
            <div className="profileTuple">
      				<strong className="profileHeading">Username</strong>
      				<p className="profileText"> {this.state.user.username} </p>
            </div>
            <div className="profileTuple">
      				<strong className="profileHeading">Name</strong>
      				<p className="profileText"> {this.state.user.givenName} </p>
            </div>
            <div className="profileTuple">
      				<strong className="profileHeading">Role</strong>
      				<p className="profileText"> {this.state.user.role} </p>
            </div>
            <div className="profileTuple">
      				<strong className="profileHeading">Cohort</strong>
      				<p className="profileText"> {this.state.user.cohort} </p>
            </div>
            <div className="profileTuple">
      				<strong className="profileHeading">TownHall</strong>
      				<p className="profileText"> {this.state.townHall} </p>
            </div>
            {this.state.user.role === 'student' ? (
              <div>
                <div className="profileTuple">
          				<strong className="profileHeading">Total Votes</strong>
          				<p className="profileText"> {this.state.votes} </p>
                </div>
                <div className="profileTuple">
          				<strong className="profileHeading">Questions Asked</strong>
          				<p className="profileText"> {this.state.questions.length} </p>
                </div>
              </div>
              ) : null
            }
          </div>
        </Paper>

				<div className="desktopHeader">Questions</div>
		      <QueueComponent
            id="profile-queue"
		        style={{textAlign: 'left !important'}}
		        title="Pending Questions"
		        questions={this.state.questions}
		        handleUpvote={this.handleUpvote}
		        handleDownvote={this.handleDownvote}
		        handleAnswered={this.handleAnswered}
		        handleDelete={this.handleDelete}
		        handleEdit={this.handleEdit}
		        handleTagDelete={this.handleTagDelete}
	          handleKeep={this.handleKeep}
	          handleUnkeep={this.handleUnkeep}
		        user={this.state.user}
		       />
				<Dialog
				  style={{width: "100%"}}
		      title="Edit Question"
		      modal={false}
		      open={this.state.open}
		      onRequestClose={this.handleClose}
		      autoScrollBodyContent={true}
		    >
		          	<TextField className="profileInput"
				        onChange={(e) => this.updateUserName(e.target.value)}
				        floatingLabelText="Update your Name..." />
					<TextField className="profileInput"
				        onChange={(e) => this.updateUserPicture(e.target.value)}
				        floatingLabelText="Update your Profile Picture..." />
					<br />
					<RaisedButton className="profileBtn" disabled={this.state.disableButton} onClick={() => this.updateCurrentUser(this.state.updatedUser)} label="SAVE" />
					<RaisedButton className="profileBtn" onClick={this.handleClose} label="GO BACK" />
				</Dialog>

	            <Link style={{padding: '4%', textAlign: 'center'}} to="/home">
	                <RaisedButton style={{width: '92%'}} label="BACK TO HOME" />
	            </Link>
		</div>
	</MuiThemeProvider>)
	}
}

export default ProfileComponent;
