import { parse } from "https://deno.land/std@0.152.0/encoding/csv.ts";
import { getMainLogger} from "./logger.ts";
import { GrepHandler, ResultStatus} from "./GrepHandler.ts"
import { ArgumentsHandler } from "./ArgumentsHandler.ts";
import { GitHandler } from "./GitHandler.ts"

const argumentsHandler = new ArgumentsHandler(Deno.args);

const LOGGER = await getMainLogger(argumentsHandler.inputArgs.verbose);

const parsedBranches = (await parse(argumentsHandler.inputArgs.branch, { separator: ";" }))[0];

for (let i = 0; i < parsedBranches.length; i++) {
    const branch = parsedBranches[i];

    const gitHandler = new GitHandler(
        argumentsHandler.inputArgs.repoUrl,
        branch,
        LOGGER
    );

    const gitHandlerResult = await gitHandler.execute();

    const fileInternalPath = `${gitHandlerResult.branchFolder}/${argumentsHandler.inputArgs.filePath}`

    const grepHandler = new GrepHandler(
        fileInternalPath,
        argumentsHandler.inputArgs.searchTerm,
        LOGGER
    );

    const result = await grepHandler.execute();

    console.log(`Branch: ${branch}`);
    if (result.status === ResultStatus.SUCCESS) console.log(result.toString());

    await gitHandler.flush();
}
