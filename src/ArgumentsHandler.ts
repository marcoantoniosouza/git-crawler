import yargs from 'https://cdn.deno.land/yargs/versions/yargs-v16.2.1-deno/raw/deno.ts';
import * as _ from 'https://deno.land/x/lodash@4.17.15-es/lodash.js';

interface Arguments {
    searchTerm: string;
    filePath: string;
    branch: string;
    repoUrl: string;
    verbose: boolean;
}

class ArgumentsHandler {
    inputArgs: Arguments;
    constructor(args : string[]) {
        let inputArgs: Arguments = yargs(args)
            .alias('s', 'searchTerm')
            .alias('f', 'filePath')
            .alias('b', 'branch')
            .alias('r', 'repoUrl')
            .alias('v', 'verbose')
            .argv;

        let errorMessages: {[k: string]: string} = {
            searchTerm: 'Provide the search term value using --search-term [-s] parameter',
            filePath: 'Provide the file path value using --file-path [-f] parameter',
            branch: 'Provide the branch value using --branch [-b] parameter',
            repoUrl: 'Provide the repository URL value using --repoUrl [-r] parameter'
        };

        let errors: string[] = _.difference(_.keys(errorMessages), _.keys(inputArgs));
        if (errors.length > 0) {
            errors.forEach(error => console.log(errorMessages[error]));
            Deno.exit(1)
        }

        this.inputArgs = inputArgs;
    }
}

export { ArgumentsHandler };



