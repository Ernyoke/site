'use strict';

const RESOURCE = 'data/data.json';

/**
 * Service class which purpose is to retrieve data from an existing outer service.
 */
export class ShellService {
    /**
     * Make a HTTP GET call to an existing resource and return a promise with the result.
     * @return {Promise<any>}
     */
    async getData() {
        return (await fetch(RESOURCE)).json();
    }

    /**
     * Retrieves the data from the input path in text format.
     * @param {string} path
     * @return {Promise<string>}
     */
    async getTextData(path) {
        const body = await fetch(path);
        return body.text();
    }
}
