import React from 'react';
import { Redirect } from 'react-router';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import EditDocument from './EditDocument.jsx';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import * as documentActions from '../actions/documents';

class MyDocumentCard extends React.Component {
  constructor(props) {
    super(props);
    this.buttonclick = this.buttonclick.bind(this);
    this.onClick = this.onClick.bind(this);
    this.showDocument = this.showDocument.bind(this);
    this.state = {
      showComponent: false,
      shouldRedirect: false
    };
  }

  onClick() {
    this.setState({
      showComponent: true,
    });
  }

  buttonclick(id) {
    this.props.documentSelected(this.props.doc);
  }

  showDocument() {
    this.setState({ shouldRedirect: true });
  }

  confirmDeletion(callback, documentId) {
    swal({
      title: 'Are you sure?',
      text: 'Would you like to delete this user?',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#DD6B55',
      confirmButtonText: 'Yes, delete!',
      closeOnConfirm: false,
      closeOnCancel: false
    },
    (deletionConfirmed) => {
      if (deletionConfirmed) {
        callback(documentId);
        swal('Deleted!', 'User has been deleted.', 'success');
      } else {
        swal('Cancelled!', 'User has not been deleted.', 'error');
      }
    });
  }

  render() {
    const { doc } = this.props;
    return (
      this.state.shouldRedirect ?
        <Redirect to={`/document/${doc.id}`} /> :
        <div className="col s12 m4">
          <div className="card grey lighten-3">
            <div className="card-content white-text cardz">
            <span className="card-title"><b>{doc.title}</b></span>
            <p className="docContent" style={{ color: 'black' }} dangerouslySetInnerHTML={{ __html: doc.content }} />
          </div>
            <div className="card-action right-align" id="IconMenu">
            <MuiThemeProvider >
              <IconMenu
                iconButtonElement={<IconButton><MoreVertIcon /></IconButton>}
                anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
                targetOrigin={{ horizontal: 'right', vertical: 'top' }}
              >
                <MenuItem primaryText="View" onTouchTap={this.showDocument} />
                <a href="#editDoc" onClick={this.onClick}>
                  <MenuItem primaryText="Edit" onTouchTap={() => this.buttonclick(doc.id)} />
                </a>
                <MenuItem primaryText="Delete" onTouchTap={() => this.confirmDeletion(this.props.actions.deleteDoc, doc.id)} />
               
              </IconMenu>
            </MuiThemeProvider>
          </div>
          </div>
          {this.state.showComponent ?
            <EditDocument /> :
          null
        }
        </div>
    );
  }
}
MyDocumentCard.propTypes = {
  doc: React.PropTypes.object.isRequired,
  actions: React.PropTypes.func.isRequired,
  documentSelected: React.PropTypes.func.isRequired
};

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(documentActions, dispatch),
});
export default connect(null, mapDispatchToProps)(MyDocumentCard);
