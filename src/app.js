import { Command } from "commander";

import { bootstrap } from "#/cli/index.js";
import { PORT } from "#/settings.js";

const program = new Command();

program
  .command("runserver")
  .description("Runs the server")
  .option("-p --port <port>", "Port", PORT)
  .option("-H --host <host>", "Host", "0.0.0.0")
  .action(async (options) => {
    await bootstrap(Number(options.port), options.host);
  });

program.parse(process.argv);
