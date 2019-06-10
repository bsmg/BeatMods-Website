import React from "react";
import { Container } from "reactstrap";

export default function NotFound(props: { history: any }) {
    return (
        <div className="app flex-row align-items-center">
            <Container>
                <h3 className="display-4">404</h3>
                <p className="lead">
                    Oops! There's nothing at <code>{props.history.location.pathname}</code>.
                </p>
                <p>
                    If you think something should be here, you can{" "}
                    <a href="https://github.com/beat-saber-modding-group/BeatMods-Website/issues/new" target="_blank">
                        open an issue
                    </a>{" "}
                    on GitHub.
                </p>
                <a href={props.history.createHref({ pathname: "/" })}>Go back to homepage</a>
            </Container>
        </div>
    );
}
