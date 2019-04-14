import * as React from "react";

export default class DefaultFooter extends React.Component<{}, {}> {
    render() {
        // eslint-disable-next-line
        return (
            <React.Fragment>
                <div>
                    <span>vanZeben and</span>
                    <a href="https://github.com/beat-saber-modding-group/BeatMods-Website/graphs/contributors">contributors</a>
                    <span>&copy; 2019</span>
                </div>
                <div className="ml-auto">
                    <a href="https://github.com/beat-saber-modding-group/BeatMods-Website">Contribute on GitHub</a>
                </div>
            </React.Fragment>
        );
    }
}
