import React from 'react';
import TextField from 'material-ui/TextField';
import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';
import { Card, CardText, CardHeader, CardTitle } from 'material-ui/Card';
import AddUserComponent from './AddUserComponent.jsx';
import DataComponent from './DataComponent.jsx';
import NextTownHallButton from './NextTownHallButton.jsx';


class AdminComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isAdmin: this.props.user.role === 'admin',
      users: this.props.users,
      cohortChoice: 'All Cohorts',
      allCohorts: [],
    }
    this.getAllCohorts = this.getAllCohorts.bind(this);
  }

  componentDidMount() {
    this.getAllCohorts();
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
      //console.log(data)
      let allCohorts = data.map(item => [item._id, item.cohort])
      this.setState({allCohorts,}) 
      //console.log(this.state.allCohorts)
    })
  }


  render() {
    return (
      !this.state.isAdmin ? <div></div> :
      <Card className="admin" initiallyExpanded={true}>
        <CardHeader title='Admin Dashboard'
          actAsExpander={false}
          showExpandableButton={false}
          />
        <CardText expandable={true}>
          <AddUserComponent 
            getAllCohorts={this.getAllCohorts}
            user={this.props.user}
            allCohorts={this.state.allCohorts}
            handleUserSubmit={this.props.handleUserSubmit} 
          />
          <DataComponent
            questions={this.props.questions}
            users={this.props.users}
            allCohorts={this.state.allCohorts}
            cohortChoice={this.props.cohortChoice}
            cityChoice={this.props.cityChoice}
            handleFilterByCohort={this.props.handleFilterByCohort}
            handleFilterByCity={this.props.handleFilterByCity}
            handleUserDelete={this.props.handleUserDelete}
            handleOpen={this.props.handleOpen}
            handleUserModify={this.props.handleUserModify}
          />
          <NextTownHallButton 
            isAdmin={this.props.isAdmin}
            handleNextTownHall={this.props.handleNextTownHall}
          />
        </CardText>
      </Card>
    );
  }
}

export default AdminComponent;
