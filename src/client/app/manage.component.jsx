import { remove } from 'lodash';
import React from 'react';
import NavBar from './navbar.component.jsx';
import AdminComponent from './AdminComponent.jsx';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Snackbar from 'material-ui/Snackbar';
import NextTownHallButton from './NextTownHallButton.jsx';
import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';




class ManageComponent extends React.Component {
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
      users: [],
      isAdmin,
      allCohorts: [''],
      cohortChoice: 'All Cohorts',
      cityChoice: 'All Cities',
      snackMessage: 'Hello World',
        snackbackgroundColor: '#536DFE',
        snackbar: false,

      open: false,
      updatedUser: {},
      disableButton: true,
    };

    this.getUsers = this.getUsers.bind(this);
  	this.getAllCohorts = this.getAllCohorts.bind(this);
    this.closeSnackbar = this.closeSnackbar.bind(this);
    this.handleUserSubmit = this.handleUserSubmit.bind(this);
		this.handleUserDelete = this.handleUserDelete.bind(this);
    this.handleFilterByCohort = this.handleFilterByCohort.bind(this);
    this.handleFilterByCity = this.handleFilterByCity.bind(this);
	  this.handleNextTownHall = this.handleNextTownHall.bind(this);

    this.handleOpen = this.handleOpen.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.updateGivenName = this.updateGivenName.bind(this);
    this.handleCohortChange = this.handleCohortChange.bind(this);
    this.handleUserModify = this.handleUserModify.bind(this);


  }
    
  componentDidMount() {
    this.getUsers();
    this.getAllCohorts();
    if(this.state.isAdmin) {
      this.interval = setInterval(() => {
        this.getUsers();
      }, 2000);
    }
  }
  componentWillUnmount() {
    clearInterval(this.interval);
  }

  handleOpen(user) {
    this.setState({ 
      updatedUser: user,
      open: true,
    });
  }

  handleClose() {
    delete this.state.updatedUser.givenName;
    delete this.state.updatedUser.avatarURL;
    this.setState({ open: false });
  }

  checkDisabled() {
    var disabled = true;
    if(this.state.updatedUser.givenName || this.state.updatedUser.cohort) disabled = false;
    this.setState({ disableButton: disabled });
  }

  updateGivenName(val) {
    this.state.updatedUser['givenName'] = val;
    if(this.state.updatedUser.givenName === '') delete this.state.updatedUser.givenName;
    this.checkDisabled();
  }


  handleCohortChange(event, index, val) {
    this.state.updatedUser['cohort'] = val;
    this.checkDisabled();
  }

  handleUserModify(userMod) {
    const _id = userMod._id;
    fetch('/api/users', {
      credentials: 'include',
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userMod),
    })
    .then(() => {
      this.setState({
          snackMessage: 'User was modified',
          snackbackgroundColor: '#E53935',
          snackbar: true,
      });
    });
    this.handleClose();
    this.getUsers();
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
    .then(users => {
  	    this.setState({ users })
      	return users;
    	})
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

  // method to update users
  handleUserSubmit(username, givenName, role, cohort) {
    let users = username.map(user => {
	      return {
	          username: user.toLowerCase(),
	          givenName,
	          role,
	          cohort,
	        }
	    })
    //console.log(username.length, 'users')
	
      fetch('/api/users', {
        credentials: 'include',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          users: users
        }),
      })
      .then((res)=>{
        this.getUsers();
        return res.json();
      })
      .then(data => {
        this.getUsers();
        console.log(data)
        if(data[1]){
          this.setState({
            snackMessage: data[1] + ' User permission(s) rejected!',
            snackbackgroundColor: '#E53935',
            snackbar: true,
          })
        }
      })
  }

  handleUserDelete(user) {
    const _id = user._id;
    fetch('/api/users', {
      credentials: 'include',
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ _id }),
    })
    .then(() => {
      this.setState((prevState) => {
        const users = prevState.users;
        remove(users, (q) => q._id === _id);
        return {
          users,
          snackMessage: 'User permission was removed',
          snackbackgroundColor: '#E53935',
          snackbar: true,
        };
      });
    });
    this.getUsers();
  }
  getAllCohorts() {
    const props = this.props;
    return fetch('/api/cohort', { credentials: 'include' })
    .then((res) => {
      if (res.status === 200 || res.status === 304) {
        return res.json();
      } else if (res.status === 403) {
        this.props.logout(() => {});
        return null;
      }
    })
    .then(data => {
      console.log(data)
      let allCohorts = data.map(item => [item._id, item.cohort])
      this.setState({allCohorts,}) 
      console.log(this.state.allCohorts)
    })
  }

  handleFilterByCohort(cohortChoice) {
    this.setState({ cohortChoice })
  }

  handleFilterByCity(cityChoice) {
    this.setState({ cityChoice })
  }

  closeSnackbar() {
    this.setState({
      snackbar: false,
      snackMessage: '',
    });
  }

	render() {
    let users, cohorts;
      cohorts = this.state.allCohorts.map(c => {
        return <MenuItem key={c[0]} value={c[1]} primaryText={c[1]} />
      })
    
      users = this.state.cohortChoice === 'All Cohorts' ? this.state.users : this.state.users.filter(u => u.cohort === this.state.cohortChoice)
      users = this.state.cityChoice === 'All Cities' ? users : users.filter(u => u.cohort.slice(0,5) === this.state.cityChoice)

		return (<MuiThemeProvider> 
			<div className="app-body">
  			<AdminComponent
          cohortChoice={this.state.cohortChoice}
  			  cityChoice={this.state.cityChoice}
          handleFilterByCohort={this.handleFilterByCohort}
  			  handleFilterByCity={this.handleFilterByCity}
          handleUserSubmit={this.handleUserSubmit}
          handleOpen={this.handleOpen}
          handleUserDelete={this.handleUserDelete}
          handleUserModify={this.handleUserModify}
          user={this.state.user}
          users={users ? users : []}
          getUsers={this.getUsers}
          questions={this.state.questions}
          isAdmin={this.state.isAdmin}
          handleNextTownHall={this.handleNextTownHall}
          />

          <Dialog
            title="Edit User"
            modal={false}
            open={this.state.open}
            onRequestClose={this.handleClose}
            autoScrollBodyContent={true}
            >
            <TextField
              name="givenName"
              className="user-input-field" 
              value={this.state.updatedUser.givenName}
              floatingLabelText='Update Given Name'
              onChange={(e) => this.updateGivenName(e.target.value)} />
              <SelectField
                className="user-input-field" 
                value={this.state.updatedUser.cohort}
                floatingLabelText='User Cohort'
                onChange={this.handleCohortChange} 
              >
                {cohorts}
              </SelectField> 
            <button disabled={this.state.disableButton} onClick={() => this.handleUserModify(this.state.updatedUser)}>SAVE</button>
            <button onClick={this.handleClose}>GO BACK</button>
          </Dialog>

        <Snackbar
              bodyStyle={{ background: this.state.snackbackgroundColor }}
              open={this.state.snackbar}
              message={this.state.snackMessage}
              autoHideDuration={4000}
              onRequestClose={this.closeSnackbar}
          />
      </div>
		</MuiThemeProvider> )
	}
}

export default ManageComponent;
