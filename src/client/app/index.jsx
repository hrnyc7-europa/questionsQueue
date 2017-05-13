import React from 'react';
import { render } from 'react-dom';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import injectTapEventPlugin from 'react-tap-event-plugin';
import AppBar from 'material-ui/AppBar';
import NavBar from './navbar.component.jsx';

import {
  HashRouter as Router,
  Route,
  Link,
  Redirect,
  withRouter,
  IndexRoute
} from 'react-router-dom';

import LoginComponent from './Login.jsx';
import HomeComponent from './home.component.jsx';
import QuestionComponent from './question.component.jsx';
import ProfileComponent from './profile.component.jsx';
import ManageComponent from './manage.component.jsx';

class Main extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loggedIn: document.cookie.includes('loggedIn=1'),
    };
    this.logout = this.logout.bind(this);
    this.login = this.login.bind(this);
  }
  login(cb) {
    this.setState({
      loggedIn: true,
    });
    cb();
  }
  logout(cb) {
    this.setState({
      loggedIn: false,
    });
    cb();
  }

  render() {
    return (
      <div>
      <NavBar loggedIn={this.state.loggedIn} />
      <Router>
        <div>
          <Route exact path="/" render={() => (
            this.state.loggedIn ? (
              <Redirect to="/home" />
            ) : (
              <Redirect push to="/login" />
            )
          )} />

          <Route path="/home"
            render={ () => (
              this.state.loggedIn ? (
                <HomeComponent logout={this.logout} />
              ) : (
                <Redirect to="/" />
              )
          )} />

          <Route path="/question"
            render={ () => (
              this.state.loggedIn ? (
                <QuestionComponent logout={this.logout} />
              ) : (
                <Redirect to="/" />
              )
          )} />

          <Route path="/profile"
            render={ () => (
              this.state.loggedIn ? (
                <ProfileComponent logout={this.logout} />
              ) : (
                <Redirect to="/" />
              )
          )} />

          <Route path="/manage"
            render={ () => (
              this.state.loggedIn ? (
                <ManageComponent logout={this.logout} />
              ) : (
                <Redirect to="/" />
              )
          )} />

          <Route path="/login" render={() => (
            <LoginComponent
              login={this.login}
              loggedIn={this.state.loggedIn} />
          )}/>
          </div>
      </Router>
      </div>
    );
  }
}

injectTapEventPlugin();
render(<Main />, document.getElementById('app'));
