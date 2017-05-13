import React from 'react';
import { Card, CardText, CardHeader, CardTitle } from 'material-ui/Card';
import UserRow from './UserRow.jsx';
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

class DataComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }


  render() {
    const users = this.props.users.map(u => (

        <UserRow
          key={u.id}
          user={u}
          handleUserDelete={this.props.handleUserDelete}
          handleUserModify={this.props.handleUserModify}
          handleOpen={this.props.handleOpen}
          />
      ));
    const cohorts = this.props.allCohorts.map(c => {
      return <MenuItem key={c[0]} value={c[1]} primaryText={c[1]} />
    })
    
    return (
      <Card className="queue" initiallyExpanded={true}>
        <CardHeader title='Manage Users'
          actAsExpander={true}
          showExpandableButton={true}
          />
        <CardText expandable={true}>
              <SelectField
                className="user-input-field" 
                value={this.props.cityChoice}
                errorText={this.props.cohortChoice !== 'All Cohorts' && this.props.cityChoice !== 'All Cities' && 'Already filtering by Cohort, Silly!'}
                floatingLabelText='Filter By City'
                onChange={(e, idx, val)=> this.props.handleFilterByCity(val)}
              >
                <MenuItem value={'All Cities'} primaryText='All Cities' />
                <MenuItem value={'HRNYC'} primaryText="New York" />
                <MenuItem value={'HRSFO'} primaryText="San Francisco" />
                <MenuItem value={'HRLAX'} primaryText="Los Angeles" />
                <MenuItem value={'HRAUS'} primaryText="Austin" />
                <MenuItem value={'HRREM'} primaryText="Remote" />
              </SelectField> 
              <SelectField
                className="user-input-field" 
                value={this.props.cohortChoice}
                floatingLabelText='Filter By Cohort'
                onChange={(e, idx, val)=> this.props.handleFilterByCohort(val)}
              >
                <MenuItem value={'All Cohorts'} primaryText='All Cohorts' />
                {cohorts}
              </SelectField>
          <Table>
            <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
              <TableRow>
                <TableHeaderColumn>Username</TableHeaderColumn>
                <TableHeaderColumn>Given Name</TableHeaderColumn>
                <TableHeaderColumn>Role</TableHeaderColumn>
                <TableHeaderColumn>Cohort</TableHeaderColumn>
                <TableHeaderColumn> Modify / Delete</TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users}
            </TableBody>
          </Table>
        </CardText>
      </Card>
    );
  }
};

export default DataComponent;