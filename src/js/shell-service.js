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
    getData() {
        return fetch(RESOURCE).then((resp) => {
            return resp.json();
        }).catch((err) => {
            throw err;
        });
    }
}
