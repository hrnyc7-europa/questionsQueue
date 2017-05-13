import { remove } from 'lodash';
import React from 'react';
import NavBar from './navbar.component.jsx';
import QueueComponent from './QueueComponent.jsx';
import NextTownHallButton from './NextTownHallButton.jsx';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Snackbar from 'material-ui/Snackbar';
import SearchBar from './SearchBar.jsx'
import {
  HashRouter as Router,
  Route,
  Link,
  Redirect,
  withRouter,
  IndexRoute
} from 'react-router-dom';
import RaisedButton from 'material-ui/RaisedButton';

// integration
import ManageComponent from './manage.component.jsx'
import QuestionComponent from './question.component.jsx'


const putRequest = (question) =>

  fetch('/api/questions', {
    credentials: 'include',
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(question),
  });

// Update an array of questions to include a modified question.
// Mutates array. Does not return a value.
const updateQuestions = (questions, newQ) => {
  const idx = questions.findIndex(i => i._id === newQ._id);
  questions[idx] = newQ;
};


class HomeComponent extends React.Component {
	constructor(props) {
    super(props);

    // Parse cookie to set up a user object with user's name and role
    const user = {};
    let isAdmin;
    document.cookie.split(';').forEach((str) => {
      const [k, v] = str.split('=').map(s => s.trim());
      if (k === 'username' || k === 'role' || k === 'cohort') {
        user[k] = v;
      }
      if (user.role === 'admin') isAdmin = true;
      else isAdmin = false;
    });

    this.state = {
  		questions: [],
  		user,
      isAdmin,
      townHall: 'TBD',
  		snackMessage: 'Hello World',
  	  snackbackgroundColor: '#536DFE',
  	  snackbar: false,

      // filter states
      location: "in *",
      query: '',
      by: "Upvotes : High to Low",
      in: "All Questions",
      currentTownHall: "All TownHalls",
      showFilters: false
		}

    this.filterHandlers = {
      'location': this.handleChangeInFilterLocation.bind(this),
      'query': this.handleChangeInFilterQuery.bind(this),
      'by': this.handleChangeInFilterBy.bind(this),
      'in': this.handleChangeInFilterIn.bind(this),
      'townHall': this.handleChangeInCurrentTownHall.bind(this)
    }

	  this.handleVote = this.handleVote.bind(this);
    this.handleUpvote = this.handleUpvote.bind(this);
    this.handleDownvote = this.handleDownvote.bind(this);
    this.handleAnswered = this.handleAnswered.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
    this.handleNextTownHall = this.handleNextTownHall.bind(this);
    this.handleTagDelete = this.handleTagDelete.bind(this);
    this.closeSnackbar = this.closeSnackbar.bind(this);
    this.getQuestions = this.getQuestions.bind(this);
    this.handleKeep = this.handleKeep.bind(this);
    this.handleUnkeep = this.handleUnkeep.bind(this);
    this.toggleFilter = this.toggleFilter.bind(this);
	}

  componentDidMount() {
    this.getTownHall();
    this.getUsers()
    .then(users => {
      this.setState({ users })
    });
    this.getQuestions();
    this.interval = setInterval(() => {
      this.getQuestions();
    }, 2000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  getTownHall() {
      const props = this.props;
      fetch('/api/townhall', { credentials: 'include' })
        .then((res) => {
          if (res.status === 200 || res.status === 304) {
            return res.json();
          } else if (res.status === 403) {
            this.props.logout(() => {});
            return null;
          }
        })
        .then(res => {
            this.setState({townHall: res.townHall})
            this.setState({currentTownHall: `TownHall #${this.state.townHall}`})}
        );
    }

  getUsers() {
    const props = this.props;
    return fetch('/api/users', { credentials: 'include' })
    .then((res) => {
      if (res.status === 200 || res.status === 304) {
        return res.json();
      } else if (res.status === 403) {
        this.props.logout(() => {});
        return null;
      }
    })
  }

  getQuestions() {
    const props = this.props;
    fetch('/api/questions', { credentials: 'include' })
      .then((res) => {
        if (res.status === 200 || res.status === 304) {
          // props.login(() => {});
          return res.json();
        } else if (res.status === 403) {
          this.props.logout(() => {});
          return null;
        }
      })
      .then(questions => {
      		this.setState({questions})
      });
  }

  handleNextTownHall() {
    fetch('api/townHall', {
      credentials: 'include',
      method: 'PUT',
      body: 'next TownHall!'
    })

    this.setState ({
      snackMessage: 'Next Town Hall Set!',
      snackbackgroundColor: '#E53935',
      snackbar: true,
    })
    window.location.reload();
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
    this.getQuestions();
  }

  handleUpvote(question) {
    this.handleVote(question, 1);
    this.setState({
      snackMessage: 'Your Vote Applied !',
      snackbackgroundColor: '#388E3C',
      snackbar: true,
    });
  }

  handleDownvote(question) {
    this.handleVote(question, -1);
    this.setState({
      snackMessage: 'Your Vote Removed !',
      snackbackgroundColor: '#FF7043',
      snackbar: true,
    });
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
          return { questions,
            snackMessage: 'Question cleared and moved to answered Queue',
            snackbackgroundColor: '#18FFFF',
            snackbar: true,
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
          questions,
          snackMessage: 'Your Question was deleted from Queue',
          snackbackgroundColor: '#E53935',
          snackbar: true,
        };
      });
    });
    this.getQuestions();
  }

  handleEdit(question) {
    putRequest(question)
      .then(res => res.json())
      .then((data) => {
        this.setState((prevState) => {
          return {
            snackMessage: 'Your Question was edited and applied to Queue',
            snackbackgroundColor: '#FBC02D',
            snackbar: true,
          };
        });
        this.getQuestions()
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
    putRequest(question).then(this.getQuestions);
    this.setState({
      snackMessage: 'Pinning the Question!',
      snackbackgroundColor: '#388E3C',
      snackbar: true,
    });
  }

  handleUnkeep(question) {
    question.keep = false;
    putRequest(question).then(this.getQuestions);
    this.setState({
      snackMessage: 'Unpinning the Question!',
      snackbackgroundColor: '#FBC02D',
      snackbar: true,
    });
  }

  // Utility

  handleRequestClose() {
    this.setState({
      open: false,
    });
  }
  closeSnackbar() {
    this.setState({
      snackbar: false,
      snackMessage: ''
    });
  }

  // Filter Functions
  questionsSearchIn(questions) {
    var filtered = questions;
    var query = this.state.query;
    if(!!query) {
      // filter!
      switch(this.state.location) {
        case "in *":
          filtered = questions.filter(question => {
            var questionText = `${question.questionText} ${question.codeSnippet} ${question.tags.join('')}`
            return questionText.includes(query);
          });
          break;
        case "in Question":
          filtered = questions.filter(question => question.questionText.includes(query));
          break;
        case "in Code Snippet":
          filtered = questions.filter(question => question.codeSnippet.includes(query));
          break;
        case "in Tags":
          filtered = questions.filter(question => {
            var queryList = query.split(' '); // ['moto', 'Node']
            var found = false;
            queryList.forEach(q => {
              // not empty
              if(!!q) {question.tags.forEach(tag => found = found || tag.includes(q))}
            })
            return found;
          });
          break;
      }
    }
    return filtered;
  }

  questionsSortBy(questions) {
    var sorted = questions;
    // sort!
    switch(this.state.by) {
      case "Upvotes : High to Low":
        sorted = questions.sort((a, b) => a.votes < b.votes);
        break;
      case "Time Created : New First":
        sorted = questions.sort((a, b) => a.createdAt < b.createdAt);
        break;
      case "Time Created : Old First":
        sorted = questions.sort((a, b) => a.createdAt > b.createdAt);
        break;
    }
    return sorted;
  }

  questionsFilterByTownHall(questions) {
    // TownHall #18 => 18
    var currentTownHall = this.state.currentTownHall;
    // filter!
    return questions.filter(question => question.cohort === this.state.user.cohort && currentTownHall === 'All TownHalls' || question.keep || `TownHall #${question.townHall}` === currentTownHall);
  }

  questionsIn(questions) {
    var filtered = questions;
    var In = this.state.in;
    // filter!
    switch(In) {
      case "Answered":
        filtered = questions.filter(question => question.answered);
        break;
      case "Unanswered":
        filtered = questions.filter(question => !question.answered);
        break;
      case "Bookmarked":
        filtered = questions.filter(question => question.keep);
        break;
    }
    return filtered;
  }

  // townhall

  // put everything together!
  questionsSearch() {
    var questions = this.state.questions;
    questions = this.questionsFilterByTownHall(questions);
    questions = this.questionsIn(questions);
    questions = this.questionsSearchIn(questions);
    questions = this.questionsSortBy(questions);
    return questions;
  }

  returnFilterState() {
    return {
      'location': this.state.location,
      'by': this.state.by,
      'in': this.state.in,
      'townHall': this.state.townHall,
      'currentTownHall': this.state.currentTownHall
    }
  }

  handleChangeInFilterLocation(location) {
    this.setState({location: location});
  }
  handleChangeInFilterQuery(event) {
    this.setState({query: event.target.value});
  }
  handleChangeInFilterBy(by) {
    this.setState({by: by});
  }
  handleChangeInFilterIn(val) {
    this.setState({in: val});
  }
  handleChangeInCurrentTownHall(townHall) {
    this.setState({currentTownHall: townHall});
  }

  toggleFilter() {
    var current = this.state.showFilters;
    this.setState({showFilters: !current})
  }

	render() {

		return (<MuiThemeProvider>
			<div className="app-body desktopBody">

      <div className="desktopView" style={{marginTop: "50px"}}>
        {this.state.isAdmin ? (<h1 className="desktopHeader"> Manage Users </h1>) : (<span />)}
        {this.state.isAdmin ? (<ManageComponent logout={this.props.logout} />) : (<span />)}

        <h1 className="desktopHeader"> Ask New Question </h1>
        <QuestionComponent logout={this.props.logout} />
        <h1 className="desktopHeader"> Questions </h1>
      </div>

			<div id="home-wrapper">
        <SearchBar
          filterState={this.returnFilterState()}
          filterHandlers={this.filterHandlers}
          toggleFilter={this.toggleFilter}
          showFilters={this.state.showFilters}
          />
          
		        <QueueComponent
			          title="Pending Questions"
			          questions={this.questionsSearch()}
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
        </div>
        <NextTownHallButton 
          isAdmin={this.state.isAdmin}
          handleNextTownHall={this.handleNextTownHall}
        />

        <div className="desktopView" style={{marginTop: '30px', marginBottom: '50px'}}>
          <Link style={{padding: '2%', textAlign: 'center'}} to="/profile">
              <RaisedButton style={{width: '96%'}} label="VIEW PROFILE" />
          </Link>
        </div>

		    <Snackbar
			        bodyStyle={{ background: this.state.snackbackgroundColor }}
			        open={this.state.snackbar}
			        message={this.state.snackMessage}
			        autoHideDuration={4000}
			        onRequestClose={this.closeSnackbar}
			    />

		</div>
		</MuiThemeProvider>)
	}
}

export default HomeComponent;
