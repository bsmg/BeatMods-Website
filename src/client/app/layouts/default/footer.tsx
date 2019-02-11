import * as React from 'react';

export default class DefaultFooter extends React.Component<{}, {}> {
  render() {

    // eslint-disable-next-line
    return (
      <React.Fragment>
        <span>&copy; 2019</span>
        <span className="ml-auto">Developed by <a href="https://vanZeben.ca">Ryan van Zeben</a></span>
      </React.Fragment>
    );
  }
}
