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

class ProfileComponent extends React.Component {
	constructor(props) {
	    super(props);

			this.state = {
					user: {
            avatarURL: 'https://heatherchristenaschmidt.files.wordpress.com/2011/09/facebook_no_profile_pic2-jpg.gif'
          },
					open: false,
				 	updatedUser: {},
					disableButton: true,
					questions: [],
					votes: 0
				}

			document.cookie.split(';').forEach((str) => {
				const [k, v] = str.split('=').map(s => s.trim());
					if (k === 'username' || k === 'role') {
					this.state.user[k] = v;
				} else if(k === 'img') {
					this.state.user['avatarURL'] = unescape(v);
				}
			});
			this.getCurrentUser();
			this.getTownHall();
			this.getQuestions();

			this.handleOpen = this.handleOpen.bind(this);
			this.handleClose = this.handleClose.bind(this);
			this.updateUserName = this.updateUserName.bind(this);
			this.updateUserPicture = this.updateUserPicture.bind(this);
			this.updateCurrentUser = this.updateCurrentUser.bind(this);
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

	getQuestions() {
    fetch('/api/questions', { credentials: 'include' })
      .then((res) => {
        if (res.status === 200 || res.status === 304) {
          return res.json();
        } else if (res.status === 403) {
          return null;
        }
      })
      .then(questions => {
					questions = questions.filter(question => question.cohort === this.state.user.cohort && question.username ===  this.state.user.username);
					questions = questions.sort((a, b) => a.createdAt > b.createdAt);
					questions = questions.sort((a, b) => a.townHall < b.townHall);
					var votes = questions.reduce(function(acc, question) {
						return acc + question.votes;
					}, 0);
					this.setState({questions: questions});
					this.setState({votes: votes});
			});

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

	getTownHall() {
      const props = this.props;
      fetch('/api/townhall', { credentials: 'include' })
        .then((res) => {
          if (res.status === 200 || res.status === 304) {
            return res.json();
          } else if (res.status === 403) {
            return null;
          }
        })
        .then(res => {
            this.setState({townHall: res.townHall})
        });
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

				<div className="profileHeading">Questions</div>
				{this.state.questions.map((question, idx) => {
					return (
						<div key={idx} className="question-wrapper" style={{border: '1px solid black', 'backgroundColor': 'lightblue'}}>
							<p className="question-created">{`TownHall #${question.townHall}`}</p>
			        		<div className="question-header-container">
			          		<div className="question-header">
		            		<div className="question-text">
				              {question.questionText.split('\n').map(function(line, idx) {
				                return <p key={idx}>{line}<br/></p>
				              })}
			            	</div>
				            <div className="question-info">
				              {/* <QuestionVoteComponent question={question} user={user} handlers={handlers}/> */}
											<div className="question-upvote">
									      <p>{question.votes}</p>
									      <i className="material-icons">star</i>
									    </div>
				            </div>
					          </div>
					          <p className="question-created">{moment(question.createdAt).fromNow()}</p>
					          {question.answered ? <span className="question-badge answered">Answered</span> : null}
					          <div className="question-tags">
					            {question.tags.map(function(tag, idx) {
					              return <span key={idx} className="question-badge">{tag}</span>
					            })}
					          </div>
			        		</div>
					        {/* <QuestionMenuComponent question={question} user={user} handlers={handlers}/> */}
									<br></br>
									<br></br>
					      </div>
							)
				})}

			    <hr style={{margin: "20px"}}/>

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
