'use strict';

const formatNumber = (numberStr, maxStringSize) => {
    let str = numberStr.toString();
    const size = str.length;
    for (let i = 0; i < maxStringSize - size; i++) {
        str = '&nbsp' + str;
    }
    return str;
};

const whiteSpace = (count) => {
    let str = '';
    for (let i = 0; i < count; i++) {
        str += '&nbsp';
    }
    return str;
};

const compareArrays = (a, b, equals) => {
    if (!!a && !!b) {
        if (a.length === b.length) {
            for (let i = 0; i < a.length; i++) {
                if (!equals(a[i], b[i])) {
                    return false;
                }
            }
            return true;
        }
    }
    return false;
};

export {formatNumber, whiteSpace, compareArrays};
