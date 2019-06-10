import React, { Component } from "react";
import { Container } from "reactstrap";

export default class Home extends Component<{ history: any; user: any | null }> {
    render() {
        return (
            <Container className="animated fadeIn p-5">
                <h2 className="display-4">Welcome to BeatMods</h2>
                <p className="lead">A Beat Saber mod repository maintained by the Beat Saber Modding Group</p>
                <hr className="my-3" />
                <p>
                    Need help installing mods? Check out the <a href="https://bsmg.wiki/beginners-guide">beginner's guide</a>.
                    <br />
                    You can also <a href="https://discord.gg/beatsabermods">join the official Discord</a>.
                </p>
                <span>Mod installers are available:</span>
                <ul>
                    <li>
                        <a href="https://github.com/beat-saber-modding-group/BeatSaberModInstaller/releases/latest">Beat Saber Mod Installer</a>
                    </li>
                    <li>
                        <a href="https://bsaber.com/beatdrop/">BeatDrop</a>
                    </li>
                    <li>
                        <a href="https://github.com/Assistant/ModAssistant/releases/latest">ModAssistant</a>
                    </li>
                </ul>
            </Container>
        );
    }
}
