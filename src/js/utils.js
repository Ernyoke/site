const formatNumber = (numberStr, maxStringSize) => {
    let str = numberStr.toString();
    const size = str.length;
    for (let i = 0; i < maxStringSize - size; i++) {
        str = '&nbsp' + str;
    }
    return str;
};

export {formatNumber};