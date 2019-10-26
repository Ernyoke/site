module.exports = {
    "env": {
        "browser": true,
        "es6": true,
        "mocha": true
    },
    "parserOptions": {
        "sourceType": "module",
    },
    "extends": [
        "eslint:recommended",
        "google",
        "plugin:mocha/recommended"
    ],
    "plugins": [
        "mocha",
        "chai-expect",
        "chai-friendly"
    ],
    "rules": {
        "indent": ["error", 4,
            {
                "SwitchCase": 1
            }],
        "max-len": ["error",
            {
                "code": 120,
                "ignoreComments": true
            }],
        "no-unused-expressions": 0,
        "chai-friendly/no-unused-expressions": 2,
        "chai-expect/missing-assertion": 2,
        "chai-expect/terminating-properties": 1
    }
};