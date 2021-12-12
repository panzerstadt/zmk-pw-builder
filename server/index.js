const { spawn, execSync } = require("child_process");
const express = require('express');
const fs = require("fs")
const app = express();
const port = process.env.PORT || 8080;

const OUTPUT_PATH = "/build/output/zephyr/zmk.uf2"

app.get('/', async (req, res) => {
    // receive json or keymap file here
    console.log("receiving these params")
    console.log(req.query)

    await runBuildProcess(res, "bt60_v1", 'string');
})

app.get('/build', async (req, res) => {
    // receive json or keymap file here
    console.log("receiving these params")
    console.log(req.query)
    await runBuildProcess(res, "bt60_v1", 'file');
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
})

const runBuildProcess = async (res, board = "bt60_v1", type = "file") => {
    return new Promise((resolve) => {
        const build = spawn("west", ["build", "-d /build/output", "-s /zmk/app", "-b " + board, "--", "-DZMK_CONFIG=/keymap-config"], { shell: true })

        build.on("close", code => {
            console.log(`child process exited with code ${code}`);
            if (code === 0) {
                // log 'ls for checking
                execSync("cd /build/output/zephyr && ls", (error, stdout, stderr) => {
                    if (error) {
                        console.log(`error: ${error.message}`);
                        return;
                    }
                    if (stderr) {
                        console.log(`stderr: ${stderr}`);
                        return;
                    }
                    console.log(`stdout: ${stdout}`);  // < --the uf2 should be hereeeee
                    // under the name zmk.uf2
                });

                // grab uf2 and send it on express
                const timestamp = Date.now()
                const filename = `bt60_${timestamp}.uf2`

                if (type === 'file') {
                    return res.download(OUTPUT_PATH, filename, (err) => {
                        if (err) return console.warn(err);
                        console.log(`${filename} has been sent!`);
                        resolve();
                    })
                }

                if (type === 'string') {
                    const filepath = OUTPUT_PATH
                    const stat = fs.statSync(filepath)

                    res.writeHead(200, {
                        "Content-Type": "application/octet-stream",
                        "Content-length": stat.size
                    })

                    const readStream = fs.createReadStream(filepath)
                    readStream.pipe(res).on('close', (err) => {
                        if (err) return console.warn(err);
                        console.log(`${filename} has been sent!`);
                        resolve();
                    })
                }


            }
            if (code === 1) {
                throw new Error("the builder has encountered an error. please check API logs for more details.")
            }
            // probably this one
        });


        // logging on API
        build.stdout.on("data", data => {
            console.log(`stdout: ${data}`);
        });

        build.stderr.on("data", data => {
            console.log(`stderr: ${data}`);
        });

        build.on('error', (error) => {
            console.log(`error: ${error.message}`);
        });

    })
}
