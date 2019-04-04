module.exports = function(api) {
    api.cache(true);
    const presets = [
        ["@babel/preset-env", {
            "targets": {
                "browsers": [">0.2%"]
            },
            "modules": "commonjs",
            "useBuiltIns": "usage"
        }], "@babel/preset-react", "@babel/preset-typescript",
    ];
    const plugins = ["@babel/plugin-syntax-dynamic-import", "@babel/plugin-syntax-import-meta", "@babel/plugin-proposal-class-properties", "@babel/plugin-proposal-object-rest-spread", "@babel/plugin-proposal-json-strings", "@babel/plugin-transform-template-literals"];
    return {
        presets,
        plugins,
        "sourceMaps": true,
        "retainLines": true,
        "ignore": ["node_modules"],
    };
}