import { Logger, setup, handlers, getLogger } from "https://deno.land/std@0.152.0/log/mod.ts";

export async function getMainLogger(verboseFlag: boolean) : Promise<Logger> {
    await setup({
        handlers: {
            console: new handlers.ConsoleHandler ("INFO", {
                formatter: "{datetime} {levelName} {msg}"
            })
        },
        loggers: {
            errors: {
                level: "ERROR",
                handlers: ["console"],
            },
            debug: {
                level: "DEBUG",
                handlers: ["console"],
            }
        }
    });

    if (verboseFlag) return getLogger('debug');
    else return getLogger('errors');
}