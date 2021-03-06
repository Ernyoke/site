module.exports = {
    "env": {
        "browser": true,
        "es6": true,
        "mocha": true
    },
    "parserOptions": {
        "sourceType": "module",
        "ecmaVersion": 8
    },
    "extends": [
        "eslint:recommended",
        "google",
        "plugin:mocha/recommended"
    ],
    "plugins": [
        "mocha",
        "chai-friendly",
        "chai-expect",
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
    },
    "globals": {
        "expect": true,
        "assert": true,
        "require": true,
        "module": true
    }

};
