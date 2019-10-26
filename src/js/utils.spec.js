import * as utils from './utils';

describe('utils', function () {
    it('should prepend whitespace characters in front of a number', function () {
        const expected = '&nbsp&nbsp1234';
        const actual = utils.formatNumber(1234, 6);
        expect(actual).to.be.equal(expected);
    });

    it('should not prepend whitespace characters if the length of the number is bigger than maxStringSize',
        function () {
            const expected = '12345';
            const actual = utils.formatNumber(12345, 3);
            expect(actual).to.be.equal(expected);
        });
});
