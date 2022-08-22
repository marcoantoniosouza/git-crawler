import { createHash } from "https://deno.land/std@0.77.0/hash/mod.ts";
import { Logger } from "https://deno.land/std@0.152.0/log/mod.ts";
import * as fs from "https://deno.land/std@0.152.0/fs/mod.ts";
import {ResultStatus} from "./GrepHandler.ts";

class GitHandlerResult {
    repoUrl : string;
    repoBranch : string;
    branchFolder : string;
    resultStatus : ResultStatus;

    constructor(repoUrl : string, repoBranch : string, branchFolder : string, resultStatus : ResultStatus) {
        this.repoUrl = repoUrl;
        this.repoBranch = repoBranch;
        this.branchFolder = branchFolder;
        this.resultStatus = resultStatus;
    }
}

class GitHandler {
    private cmd : Deno.Process;
    private repoUrl : string;
    private repoBranch : string;
    private logger : Logger;
    private branchFolder : string;

    constructor(repoUrl: string, repoBranch: string, logger: Logger) {
        this.repoUrl = repoUrl;
        this.repoBranch = repoBranch;
        this.logger = logger;

        const hasher = createHash("md5").update(repoBranch);
        this.branchFolder = `./temp/${hasher.toString("hex")}`;
        fs.emptyDirSync(this.branchFolder);

        this.cmd = Deno.run({
            cmd: ["git", "clone", "--branch", repoBranch, repoUrl, this.branchFolder],
            stdout: "piped",
            stderr: "piped"
        });
    }

    private decodeString(encodedString: Uint8Array) : string {
        if (encodedString.length > 0) return new TextDecoder().decode(encodedString);
        else return ResultStatus.NOT_FOUND;
    }

    async execute() : Promise<GitHandlerResult> {
        await this.cmd.status();
        const output = await this.cmd.output();
        const errOutput = await this.cmd.stderrOutput();
        const strOutput = new TextDecoder().decode(output);

        let resultStatus;

        if (errOutput.length > 0 || strOutput == ResultStatus.NOT_FOUND) {
            const errorMessage = this.decodeString(errOutput);
            this.logger.warning(errorMessage);
            resultStatus = ResultStatus.ERROR;
        } else {
            resultStatus = ResultStatus.SUCCESS;
        }

        return new GitHandlerResult(this.repoUrl, this.repoBranch, this.branchFolder, resultStatus);
    }

    flush() : void {
        fs.emptyDirSync("./temp")
    }
}

export { GitHandler };