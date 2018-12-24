'use strict';

class ListItem {
    constructor(value) {
        this._value = value;
        this._next = null;
        this._previous = null;
    }

    set next(next) {
        this._next = next;
    }

    set previous(previous) {
        this._previous = previous;
    }

    get next() {
        return this._next;
    }

    get previous() {
        return this._previous;
    }

    set value(value) {
        this._value = value;
    }

    get value() {
        return this._value;
    }
}

export class LinkedList {
    constructor() {
        this._first = null;
        this._last = null;
        this._size = 0;

        this._current = null;
    }

    set first(value) {
        const item = new ListItem(value);
        if (!!this._first) {
            item._next = this._first;
            this._first.previous = item;
            this._first = item;
        } else {
            this._first = item;
            this._last = item;
            this._current = item;
        }
        this._size++;
    }

    set last(value) {
        const item = new ListItem(value);
        if (!!this._last) {
            item.previous = this._last;
            this._last.next = item;
            this._last = item;
        } else {
            this._first = item;
            this._last = item;
        }
        this._current = item;
        this._size++;
    }

    deleteFirst() {
        if (!!this._first) {
            this._first = this._first.next;
            this._first.previous = null;
        }
        this._size--;
    }

    deleteLast() {
        if (!!this._last) {
            this._last = this._first.previous;
            this._last.next = null;
        }
        this._size--;
    }

    navigateBackward() {
        let current = this._current;
        if (!!this._current && !!this._current.previous) {
            this._current = this._current.previous;
        }
        return !!current ? current.value : null;
    }

    navigateForward() {
        if (!!this._current && !!this._current.next) {
            this._current = this._current.next;
        }
        return !!this._current ? this._current.value : null;
    }

    reset() {
        this._current = this._last;
    }

    get last() {
        return this._last;
    }

    get first() {
        return this._first;
    }

    get size() {
        return this._size;
    }
}