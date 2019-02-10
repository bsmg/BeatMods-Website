import * as React from 'react';

export default class DefaultFooter extends React.Component<{}, {}> {
  render() {

    // eslint-disable-next-line
    return (
      <React.Fragment>
        <span><a href="https://coreui.io">CoreUI</a> &copy; 2018 creativeLabs.</span>
        <span className="ml-auto">Powered by <a href="https://coreui.io/react">CoreUI for React</a></span>
      </React.Fragment>
    );
  }
}
