import { Logger } from "next-axiom";

const log = new Logger({ source: process.env.AXIOM_SERVICE_NAME });

export { log };
