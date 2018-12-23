import test from 'ava';
import {formatNumber, whiteSpace} from './utils'

test('formatNumber', async t => {
    const expected = '&nbsp&nbsp&nbsp26';
    const actual  = formatNumber(26, 5);
    t.true(actual === expected);
});

test ('whitespace', async t => {
    const expected = '&nbsp&nbsp&nbsp&nbsp&nbsp';
    const actual = whiteSpace(5);
    t.true(actual === expected);
});