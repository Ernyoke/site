import test from "ava";
import {formatNumber} from './utils'

test('formatNumber', async t => {
    const expected = "&nbsp&nbsp&nbsp26";
    const actual  = formatNumber(26, 5);
    t.true(actual === expected);
});