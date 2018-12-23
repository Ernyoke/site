const formatNumber = (numberStr, maxStringSize) => {
    let str = numberStr.toString();
    const size = str.length;
    for (let i = 0; i < maxStringSize - size; i++) {
        str = '&nbsp' + str;
    }
    return str;
};

const whiteSpace = count => {
    let str = '';
    for (let i = 0; i < count; i++) {
        str += '&nbsp';
    }
    return str;
};

export {formatNumber, whiteSpace};