import React from 'react';
import TextField from 'material-ui/TextField';
import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';
import { Card, CardText, CardHeader, CardTitle } from 'material-ui/Card';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import Snackbar from 'material-ui/Snackbar';


class AddUserComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      givenName: '',
      role: 'student',
      cohort: props.user.cohort,
      cohortDelete: '',
      cohortCity: props.user.cohort.slice(0,5),
      cohortNumber: props.user.cohort.slice(6),
      bulkSubmit: '',
      allCohorts: [],
      snackMessage: 'Hello World',
        snackbackgroundColor: '#536DFE',
        snackbar: false,
    }
    this.closeSnackbar = this.closeSnackbar.bind(this);
    this.getAllCohorts = this.getAllCohorts.bind(this);
    this.handleUserSubmit = this.handleUserSubmit.bind(this);
    this.handleCohortChange = this.handleCohortChange.bind(this);
    this.handleCohortDelete = this.handleCohortDelete.bind(this);
    this.handleDeleteCohortChange = this.handleDeleteCohortChange.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleCohortNumberChange = this.handleCohortNumberChange.bind(this);
    this.handleCohortCityChange = this.handleCohortCityChange.bind(this);
    this.handleNewCohortSubmit = this.handleNewCohortSubmit.bind(this);
    this.handleRoleChange = this.handleRoleChange.bind(this);

  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;
    this.setState({
      [name]: value,
    });
  }

  handleCohortChange(event, index, value) {
    this.setState({ cohort:value });
  }
  handleDeleteCohortChange(event, index, value) {
    this.setState({ cohortDelete:value });
  }

  getAllCohorts() {
    this.props.getAllCohorts();
  }

  handleCohortCityChange(event, index, value) {
    this.setState({ cohortCity:value });
  }

  handleCohortNumberChange(event, index, value) {
    this.setState({ cohortNumber:value });
  }

  handleRoleChange(event, index, value) {
    this.setState({ role:value });
  }

  handleNewCohortSubmit(event) {
    event.preventDefault();
    fetch('/api/cohort', {
      credentials: 'include',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({cohort: this.state.cohortCity + '-' + this.state.cohortNumber}),
    })
    .then(res => {
      this.getAllCohorts();
      return res.json()
    })
    .then(data => {
      if(data.cohort !== undefined) {
        this.setState({
          snackMessage: 'New Cohort Submitted: ' + data.cohort,
          snackbackgroundColor: '#FBC02D',
          snackbar: true,
        })
      }
    })
  }

  handleCohortDelete(event) {
    event.preventDefault();
    console.log('delete cohort:', this.state.cohortDelete);
    fetch('/api/cohort', {
      credentials: 'include',
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({cohort: this.state.cohortDelete}),
    })
    .then(res => {
      this.getAllCohorts();
      return res.json()
    })
    .then(data => {
      this.setState({
        snackMessage: 'Cohort Deleted',
        snackbackgroundColor: '#E53935',
        snackbar: true,
      })
    })
  }
  handleUserSubmit(event) {
    event.preventDefault();
    if(this.state.username) {
      this.props.handleUserSubmit([this.state.username], this.state.givenName || null, this.state.role, this.state.cohort)
    } else if (this.state.bulkSubmit) {
      const users = this.state.bulkSubmit.split(' ');
      this.props.handleUserSubmit(users, null, this.state.role, this.state.cohort)
    }
    this.setState({
      username: '',
      givenName: '',
      bulkSubmit: '',
    });
  }
  closeSnackbar() {
    this.setState({
      snackbar: false,
      snackMessage: '',
    });
  }

  render() {
    const cohorts = this.props.allCohorts.map(c => {
      return <MenuItem key={c[0]} value={c[1]} primaryText={c[1]} />
    })

    return (
    <div>
        <Card className="add-user" initiallyExpanded={false}>
          <CardHeader title='Add Users'
            actAsExpander={true}
            showExpandableButton={true}
            />
          <CardText expandable={true}>
            <form onSubmit={this.handleUserSubmit} >
              {<div>
                <div className="question-admin-header">
                  <span className="question-admin-title"> Add One New User </span>
                </div>
                <TextField
                  name="username"
                  className="user-input-field" 
                  value={this.state.username}
                  errorText={(this.state.username && this.state.bulkSubmit) ? "Enter either one user or a bulk user submission, not both" : ""}
                  floatingLabelText='Github Handle'
                  onChange={this.handleInputChange} />
                <TextField
                  name="givenName"
                  className="user-input-field" 
                  value={this.state.givenName}
                  floatingLabelText='Given Name'
                  onChange={this.handleInputChange} />
                <br />
                <br />
                <br />
                <br />

                <div className="question-admin-header">
                  <span className="question-admin-title"> Bulk User Submission </span>
                </div>
                <TextField
                  name='bulkSubmit'
                  className="user-input-field"
                  value={this.state.bulkSubmit}
                  floatingLabelText="Enter GitHub Usernames separated by spaces..."
                  errorText={(this.state.username && this.state.bulkSubmit) ? "Enter either one user or a bulk user submission, not both" : ""}
                  fullWidth={true}
                  onChange={this.handleInputChange} />
                  <br />
                <SelectField
                  className="user-input-field" 
                  value={this.state.role}
                  floatingLabelText='User Role'
                  onChange={this.handleRoleChange} 
                >
                  <MenuItem value="admin" primaryText="admin" />
                  <MenuItem value="student" primaryText="student" />
                </SelectField>
                <SelectField
                  className="user-input-field" 
                  value={this.state.cohort}
                  floatingLabelText='User Cohort'
                  onChange={this.handleCohortChange} 
                >
                  {cohorts}
                </SelectField> 
              </div>}
                <RaisedButton type="submit" className="submit-button" disabled={!this.state.username && !this.state.bulkSubmit || this.state.username && this.state.bulkSubmit} label="Add Users" />
            </form>
            </CardText>
          </Card>
          <Card className="add-user" initiallyExpanded={false}>
            <CardHeader title='Add & Delete Cohorts'
              actAsExpander={true}
              showExpandableButton={true}
              />
            <CardText expandable={true}>
            <form onSubmit={this.handleNewCohortSubmit} >
                <div className="question-admin-header">
                  <span className="question-admin-title"> Create New Cohort </span>
                </div>
                
                <SelectField
                style={{width: '50%'}}
                  className="user-input-field" 
                  value={this.state.cohortCity}
                  floatingLabelText='User Cohort City'
                  onChange={this.handleCohortCityChange} 
                >
                  <MenuItem value={'HRNYC'} primaryText="New York" />
                  <MenuItem value={'HRSFO'} primaryText="San Francisco" />
                  <MenuItem value={'HRLAX'} primaryText="Los Angeles" />
                  <MenuItem value={'HRAUS'} primaryText="Austin" />
                  <MenuItem value={'HRREM'} primaryText="Remote" />
                </SelectField> 
                <TextField
                style={{width: '50%'}}
                  name="cohortNumber"
                  errorText={(+this.state.cohortNumber < 0 || +this.state.cohortNumber >400 || isNaN(+this.state.cohortNumber)) ? "Please enter a valid cohort number" : ""}
                  className="user-input-field" 
                  value={this.state.cohortNumber}
                  floatingLabelText='Enter Cohort Number'
                  onChange={this.handleInputChange} />
                <RaisedButton type="submit" className="submit-button" disabled={!this.state.cohortCity || !this.state.cohortNumber || typeof +this.state.cohortNumber !== 'number'} label="Add New Cohort" />
            </form>
            <form onSubmit={this.handleCohortDelete} >
              <div className="question-admin-header">
                <span className="question-admin-title"> Delete Cohort </span>
              </div>
                
              <SelectField
                  className="user-input-field" 
                  value={this.state.cohortDelete}
                  floatingLabelText='Delete Cohort'
                  onChange={this.handleDeleteCohortChange} 
                >
                  {cohorts}
                </SelectField> 
                <RaisedButton type="submit" className="submit-button" disabled={!this.state.cohortDelete} label="Delete Cohort" />
            </form>
          </CardText>
        </Card>
        <Snackbar
              bodyStyle={{ background: this.state.snackbackgroundColor }}
              open={this.state.snackbar}
              message={this.state.snackMessage}
              autoHideDuration={4000}
              onRequestClose={this.closeSnackbar}
          />
    </div>
    );
  }
}

export default AddUserComponent;
