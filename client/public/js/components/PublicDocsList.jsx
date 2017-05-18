import React, { Component } from 'react';
import { Pagination } from 'react-materialize';
import DocumentCard from './DocumentCard.jsx';

/**
 * @export
 * @class PublicDocsList
 */
export default class PublicDocsList extends Component {
  /**
   * Creates an instance of PublicDocsList.
   * @param {any} props - props
   * @memberOf PublicDocsList
   */
  constructor(props) {
    super(props);
    this.state = {
      currentPage: 1
    };
    this.changePage = this.changePage.bind(this);
  }

  /**
   * @param {any} currentPage - current page
   * @returns {void}
   * @memberOf MyDocsList
   */
  changePage(currentPage) {
    this.setState({
      currentPage
    });
  }

  /**
   * @returns {jsx} Public Documents Pagination
   * @memberOf PublicDocsList
   */
  render() {
    const { docs } = this.props;
    const emptyMessage = (
      <div className="container">
        <p className="center-align">There are no Public Documents yet</p>
      </div>
    );

    let publicDocsList = docs.filter(doc => doc.access === 'public');

    const totalDocuments = publicDocsList.length;
    const pageSize = 6;
    const end = this.state.currentPage * pageSize;
    const start = end - pageSize;
    publicDocsList = publicDocsList.slice(start, end);

    const docsList = (
      <div className="container" id="docList">
        <div className="row">
          { publicDocsList.map(doc => <DocumentCard doc={doc} key={doc.id} />) }
        </div>
      </div>
  );

    return (
      <div>
        <div className="right-align">
          {
            totalDocuments > 0 ?
              <Pagination
                items={Math.ceil(totalDocuments / pageSize)}
                activePage={this.state.currentPage}
                onSelect={current => this.changePage(current)}
              />
            : ''
          }
        </div>
        { publicDocsList.length === 0 ? emptyMessage : docsList }
      </div>
    );
  }
}

PublicDocsList.propTypes = {
  docs: React.PropTypes.array.isRequired
};
