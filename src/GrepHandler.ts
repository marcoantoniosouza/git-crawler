import { Logger } from "https://deno.land/std@0.152.0/log/mod.ts";
import { parse } from "https://deno.land/std@0.152.0/encoding/csv.ts";

enum ResultStatus {
    ERROR = "ERROR",
    SUCCESS = "SUCCESS",
    NOT_FOUND = "NOT_FOUND"
}

class GrepResultHandlerResult  {
    lineNumber: number;
    lineStr: string;
    status: ResultStatus;
    errorMessage: string;

    constructor(lineNumber: number, lineStr: string, status: ResultStatus, errorMessage = "") {
        this.lineNumber = lineNumber;
        this.lineStr = lineStr;
        this.status = status;
        this.errorMessage = errorMessage;
    }

    toString() : string {
        if (this.status === ResultStatus.SUCCESS) {
            return `The term was founded at line ${this.lineNumber}: ${this.lineStr}`;
        }
        return `An error occured with the type ${this.status} and message ${this.errorMessage}`;
    }
}

class GrepHandler {
    private filePath: string;
    private searchTerm: string;
    private logger: Logger;
    private cmd: Deno.Process;

    constructor(filePath: string, searchTerm: string, logger: Logger) {
        this.filePath = filePath;
        this.searchTerm = searchTerm;
        this.logger = logger;

        this.cmd = Deno.run({
            cmd: ["grep", "-n", searchTerm, filePath],
            stdout: "piped",
            stderr: "piped"
        })
    }

    private decodeString(encodedString: Uint8Array) : string {
        if (encodedString.length > 0) return new TextDecoder().decode(encodedString);
        else return ResultStatus.NOT_FOUND;
    }

    async execute() : Promise<GrepResultHandlerResult> {
        await this.cmd.status();
        const output = await this.cmd.output();
        const errOutput = await this.cmd.stderrOutput();
        const strOutput = this.decodeString(output);

        if (errOutput.length > 0 || strOutput == ResultStatus.NOT_FOUND) {
            const errorMessage = this.decodeString(errOutput);
            this.logger.error(errorMessage);

            return new GrepResultHandlerResult(-1, "", ResultStatus.ERROR, errorMessage);
        }
        else {
            const parsedOutput = (await parse(strOutput, { separator: ":" }))[0];

            this.logger.info(parsedOutput);
            const lineNumber = Number(parsedOutput[0]);
            const lineStr = parsedOutput[1];

            return new GrepResultHandlerResult(lineNumber, lineStr, ResultStatus.SUCCESS);
        }
    }
}

export { GrepHandler, GrepResultHandlerResult, ResultStatus };