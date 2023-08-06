const { spawn, execSync } = require("child_process");
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const app = express();
const port = process.env.PORT || 8080;

const getBoard = require("./mapper").getBoard;

const execute = (command) => {
  return execSync(command, (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
  });
};

const WHITELIST = [
  "http://localhost:3000", // local version of polarity works site
  "http://localhost:8080", // keymap-editor from branch dev/local
  "https://polarity-works-lp-panzerstadt.vercel.app", // stg-me
  "https://polarity-works-lp.vercel.app", // prod-me
  "https://polarity-works-deploy-polaritywork.vercel.app", // stg-pw
  "https://polarity-works.vercel.app", // prod-pw
  "https://www.polarityworks.com", // published URL
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (WHITELIST.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        if (origin === undefined) {
          callback(
            new Error(
              "this API is not meant to be accessed from the browser. please request from the associated Frontend service."
            )
          );
        }

        callback(new Error(`${origin} is Not allowed by CORS`));
      }
    },
  })
);
app.use(express.json());
app.post("/", async (req, res) => {
  await runBuildProcess(req, res, "string");
});

app.post("/build", async (req, res) => {
  // receive json or keymap file here
  console.log("receiving these params");
  console.log(req.query);
  await runBuildProcess(req, res, "file").catch((err) => {
    console.log("Build Process encountered an error.");
    console.log(err);
    res.status(500).send(err);
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

const runBuildProcess = async (req, res, type = "file") => {
  const timestamp = Date.now();
  const inputDir = `/keymap-config_${timestamp}`;
  const outputDir = `/build_${timestamp}`;
  const outputPath = outputDir + "/output/zephyr/zmk.uf2";

  const keymapAsString = req.body.keymapAsString;
  const boardName = getBoard(req.body.keyboardId);
  if (boardName === null)
    throw new Error(`requested board not found. you asked for: ${req.board.keyboardId}`);

  const boardId = req.body.keyboardId;
  const boardConfigDir = "/board-config/" + boardId + "/config/boards";

  console.log(`building: ${JSON.stringify({ boardId, boardName, boardConfigDir }, null, 2)}`);

  // make a working folder
  execute(`mkdir ${inputDir}`);
  // turn incoming keymap into file
  fs.writeFileSync(`${inputDir}/${boardName}.keymap`, keymapAsString, (err) => {
    if (err) console.warn(err);
  });
  console.log(`created file ${inputDir}/${boardName}.keymap`);

  // copy over the configs for the board
  console.log(`copying over board config with command: cp -vr ${boardConfigDir} ${inputDir}/`);
  execute(`cp -vr ${boardConfigDir} ${inputDir}/`);

  // run west
  console.log(
    `running west build: west build -d ${outputDir}/output -s /zmk/app -b ${boardName} -- -DZMK-CONFIG=${inputDir}`
  );
  // FIXME: don't forget to delete the input and output dirs when done
  return new Promise((resolve) => {
    const build = spawn(
      "west",
      [
        "build",
        "-d " + `-d ${outputDir}/output`,
        "-s /zmk/app",
        "-b " + boardName,
        "--",
        "-DZMK_CONFIG=" + inputDir,
      ],
      { shell: true }
    );

    build.on("close", (code) => {
      console.log(`child process exited with code ${code}`);
      if (code === 0) {
        // log 'ls for checking
        execute(`cd ${outputDir}/output/zephyr && ls`);

        // grab uf2 and send it on express
        const timestamp = Date.now();
        const filename = `polarityworks-bt_${timestamp}.uf2`;

        if (type === "file") {
          return res.download(outputPath, filename, (err) => {
            if (err) return console.warn(err);
            console.log(`${filename} has been sent!`);
            resolve();
          });
        }

        if (type === "string") {
          const filepath = outputPath;
          const stat = fs.statSync(filepath);

          res.writeHead(200, {
            "Content-Type": "application/octet-stream",
            "Content-length": stat.size,
          });

          const readStream = fs.createReadStream(filepath);
          readStream.pipe(res).on("close", (err) => {
            if (err) return console.warn(err);
            console.log(`${filename} has been sent!`);

            // cleanup
            execute(`rm -rf ${inputDir}`);
            execute(`rm -rf ${outputDir}`);
            resolve();
          });
        }
      }
      if (code === 1) {
        // cleanup
        execute(`rm -rf ${inputDir}`);
        execute(`rm -rf ${outputDir}`);
        resolve();
        throw new Error(
          "the builder has encountered an error. please check API logs for more details."
        );
      }
    });

    // logging on API
    build.stdout.on("data", (data) => {
      console.log(`stdout: ${data}`);
    });

    build.stderr.on("data", (data) => {
      console.log(`stderr: ${data}`);
    });

    build.on("error", (error) => {
      console.log(`error: ${error.message}`);
    });
  });
};
