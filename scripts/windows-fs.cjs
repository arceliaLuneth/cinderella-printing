// Windows may report EPERM for concurrent mkdir on an already-created directory.
// Normalize that case and retry transient directory locks during Next.js builds.
// Writes and other permission errors are left unchanged.
/* eslint-disable @typescript-eslint/no-require-imports -- Node loads this preload with --require. */
if (process.platform === "win32") {
  const promises = require("node:fs/promises");
  const fs = require("node:fs");
  const { syncBuiltinESMExports } = require("node:module");
  const mkdir = promises.mkdir.bind(promises);
  promises.mkdir = async function (...args) {
    for (let attempt = 0; ; attempt++) {
      try { return await mkdir(...args); }
      catch (error) {
        if (error.code !== "EPERM") throw error;
        try {
          if ((await promises.stat(args[0])).isDirectory()) {
            if (args[1] && typeof args[1] === "object" && args[1].recursive) return undefined;
            error.code = "EEXIST";
            throw error;
          }
        } catch (statError) { if (statError === error) throw error; }
        if (attempt >= 8) throw error;
        await new Promise(resolve => setTimeout(resolve,40 * (attempt + 1)));
      }
    }
  };
  const mkdirCallback = fs.mkdir.bind(fs);
  fs.mkdir = function (...args) {
    const callback = args.pop();
    let attempt = 0;
    const run = () => mkdirCallback(...args,(error,...result) => {
      if (!error || error.code !== "EPERM") return callback(error,...result);
      fs.stat(args[0],(statError,stat) => {
        if (!statError && stat.isDirectory()) {
          if (args[1] && typeof args[1] === "object" && args[1].recursive) return callback(null);
          error.code = "EEXIST"; return callback(error);
        }
        if (attempt++ >= 8) return callback(error);
        setTimeout(run,40 * attempt);
      });
    });
    run();
  };
  syncBuiltinESMExports();
}
