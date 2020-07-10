'use strict';

/**
 * Utility class which is used as a wrapper for elements held inside a LinkedList.
 */
class ListItem {
    /**
     *
     * @param {Object} value
     */
    constructor(value) {
        this._value = value;
        this._next = null;
        this._previous = null;
    }

    /**
     *
     * @param {Object|null} next
     */
    set next(next) {
        this._next = next;
    }

    /**
     *
     * @param {Object|null} previous
     */
    set previous(previous) {
        this._previous = previous;
    }

    /**
     *
     * @return {Object}
     */
    get next() {
        return this._next;
    }

    /**
     *
     * @return {Object}
     */
    get previous() {
        return this._previous;
    }

    /**
     *
     * @param {Object} value
     */
    set value(value) {
        this._value = value;
    }

    /**
     *
     * @return {Object}
     */
    get value() {
        return this._value;
    }
}

/**
 * Implementation of a simple linked list container.
 */
export class LinkedList {
    /**
     *
     */
    constructor() {
        this._first = null;
        this._last = null;
        this._size = 0;

        this._current = null;
    }

    /**
     * Prepend an element to the head of the list.
     * @param {Object|null}value
     */
    set first(value) {
        const item = new ListItem(value);
        if (this._first) {
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

    /**
     * Append an element to the end of the list.
     * @param {Object|null}value
     */
    set last(value) {
        const item = new ListItem(value);
        if (this._last) {
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

    /**
     * Remove the first element (the head) from the list.
     */
    deleteFirst() {
        if (this._first) {
            this._first = this._first.next;
            this._first.previous = null;
        }
        this._size--;
    }

    /**
     * Remove the last element (tail) from the list.
     */
    deleteLast() {
        if (this._last) {
            this._last = this._first.previous;
            this._last.next = null;
        }
        this._size--;
    }

    /**
     * Navigate inside the list.
     * @return {Object}
     */
    navigateBackward() {
        const current = this._current;
        if (!!this._current && !!this._current.previous) {
            this._current = this._current.previous;
        }
        return current ? current.value : null;
    }

    /**
     * Navigate inside the list.
     * @return {Object}
     */
    navigateForward() {
        if (!!this._current && !!this._current.next) {
            this._current = this._current.next;
        }
        return this._current ? this._current.value : null;
    }

    /**
     * Remove all the elements from the list.
     */
    reset() {
        this._current = this._last;
    }

    /**
     * Return the last element (tail) from the list.
     * @return {Object}
     */
    get last() {
        return this._last;
    }

    /**
     * Return the first element (head) from the list.
     * @return {Object}
     */
    get first() {
        return this._first;
    }

    /**
     * Returns the number of elements inside the list.
     * @return {number}
     */
    get size() {
        return this._size;
    }
}
