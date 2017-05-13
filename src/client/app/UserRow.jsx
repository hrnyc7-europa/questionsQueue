import React from 'react';
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';
import IconButton from 'material-ui/IconButton';


const UserRow = (props) => {
  const user = props.user;
  const username = user.username;
  const givenName = user.givenName;
  const role = user.role;
  const cohort = user.cohort;
  const deleteIcon = <IconButton onClick={() => props.handleUserDelete(user)} iconClassName="material-icons" tooltip='Delete User'>delete</IconButton>;
  const modifyIcon = <IconButton onClick={() => props.handleOpen(user)} iconClassName="material-icons" tooltip='Modify User'>build</IconButton>;


  return (
    <TableRow className="user-row">
      <TableRowColumn className="user-row">{username}</TableRowColumn>
      <TableRowColumn className="user-row">{givenName}</TableRowColumn>
      <TableRowColumn className="user-row">{role}</TableRowColumn>
      <TableRowColumn className="user-row">{cohort}</TableRowColumn>
      <TableRowColumn className="user-row">{modifyIcon} {deleteIcon}</TableRowColumn>
    </TableRow>
  );
};


export default UserRow;
