const RESOURCE = 'data/data.json';

export class ShellService {
    getData() {
        return fetch(RESOURCE).then(resp =>  {
            return resp.json();
        }).catch(err => {
            console.error(err);
        });
    }
}