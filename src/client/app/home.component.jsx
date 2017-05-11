import { remove } from 'lodash';
import React from 'react';
import NavBar from './navbar.component.jsx';
import QueueComponent from './QueueComponent.jsx';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Snackbar from 'material-ui/Snackbar';
import SearchBar from './SearchBar.jsx'


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
	    document.cookie.split(';').forEach((str) => {
	      const [k, v] = str.split('=').map(s => s.trim());
	      if (k === 'username' || k === 'role') {
	        user[k] = v;
	      }
	    });

	    this.state = {
			questions: [],
			user,
			snackMessage: 'Hello World',
		  snackbackgroundColor: '#536DFE',
		  snackbar: false,

      // filter states
      location: "in *",
      query: '',
      by: "Upvotes : High to Low",
      in: "All Questions"
		}

    this.filterHandlers = {
      'location': this.handleChangeInFilterLocation.bind(this),
      'query': this.handleChangeInFilterQuery.bind(this),
      'by': this.handleChangeInFilterBy.bind(this),
      'in': this.handleChangeInFilterIn.bind(this)
    }

		  this.handleVote = this.handleVote.bind(this);
	    this.handleUpvote = this.handleUpvote.bind(this);
	    this.handleDownvote = this.handleDownvote.bind(this);
	    this.handleAnswered = this.handleAnswered.bind(this);
	    this.handleDelete = this.handleDelete.bind(this);
	    this.handleEdit = this.handleEdit.bind(this);
	    this.handleTagDelete = this.handleTagDelete.bind(this);
	    this.closeSnackbar = this.closeSnackbar.bind(this);
      this.getQuestions = this.getQuestions.bind(this);
      this.handleKeep = this.handleKeep.bind(this);
      this.handleUnkeep = this.handleUnkeep.bind(this);

	}

  componentDidMount() {
    this.getUsers()
    .then(users => {
      this.setState({ users })
      //console.log(this.state.users)
    });
    this.getQuestions();
    this.interval = setInterval(() => {
      this.getQuestions();
    }, 2000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
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
      		this.setState({questions: questions})}
      );
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
    console.log('keep');
    question.keep = true;
    putRequest(question).then(this.getQuestions);
    this.setState({
      snackMessage: 'Pinning the Question!',
      snackbackgroundColor: '#388E3C',
      snackbar: true,
    });
  }

  handleUnkeep(question) {
    console.log('unkeep');
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
    //console.log(questions);
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
    }
    return filtered;
  }

  // townhall

  // put everything together!
  questionsSearch() {
    var questions = this.state.questions;
    questions = this.questionsIn(questions);
    questions = this.questionsSearchIn(questions);
    questions = this.questionsSortBy(questions);
    return questions;
  }

  returnFilterState() {
    return {
      'location': this.state.location,
      'by': this.state.by,
      'in': this.state.in
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
  handleChangeInFilterReversed(reversed) {
    this.setState({reversed: reversed});
  }

	render() {

		return (<MuiThemeProvider>
			<div className="app-body">
			<NavBar />
			<div id="home-wrapper">

        <SearchBar
          filterState={this.returnFilterState()}
          filterHandlers={this.filterHandlers}
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
