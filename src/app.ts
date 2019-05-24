import express from "express";
import historyApiFallback from "connect-history-api-fallback";
import * as path from "path";
import webpack from "webpack";
import webpackDevMiddleware from "webpack-dev-middleware";
import webpackHotMiddleware from "webpack-hot-middleware";

const webpackConfig = require("../webpack.config");

import server from "./server";

const isDev = process.env.NODE_ENV !== "production";
const port = Number(process.env.PORT) || 3000;

const app = express();
app.use("/uploads", express.static(path.join(__dirname, "../", "uploads")));
app.use("/api", server);

function rootRoute(req, res) {
    res.sendFile(path.resolve(__dirname, "../dist/client/index.html"));
    res.end();
}

if (isDev) {
    const compiler = webpack(webpackConfig);

    app.use(
        historyApiFallback({
            verbose: false
        })
    );

    app.use(
        webpackDevMiddleware(compiler, {
            publicPath: webpackConfig.output.publicPath,
            contentBase: path.resolve(__dirname, "./client/public"),
            stats: {
                colors: true,
                hash: false,
                timings: true,
                chunks: false,
                chunkModules: false,
                modules: false
            }
        })
    );

    app.use(webpackHotMiddleware(compiler));
    app.use(express.static(path.resolve(__dirname, "./client/public/index.html")));
} else {
    app.use(express.static(path.resolve(__dirname, "../dist/client")));
    app.get("/", rootRoute);
    app.get("/*worker*", rootRoute);
}

app.use((req, res) => {
    res.status(404);
    if (req.accepts("html")) {
        res.sendFile(path.resolve(__dirname, "../dist/client/404.html"));
    } else {
        res.json({ error: "Not found", code: 404, url: req.url });
    }
});

app.listen(port, err => {
    if (err) {
        console.log(err);
    }

    console.info(">>> 🌎 Open http://localhost:%s/ in your browser.", port);
});
