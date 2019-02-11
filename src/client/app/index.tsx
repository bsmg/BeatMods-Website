import * as React from "react";
import * as ReactDOM from "react-dom";
import App from "./App";
import registerServiceWorker from "./registerServiceWorker";
import JWTInterceptor from "./utils/jwt.interceptor";
new JWTInterceptor().register();
ReactDOM.render(<App />, document.getElementById("root") as HTMLElement);
registerServiceWorker();
