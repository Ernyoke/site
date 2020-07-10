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
}
