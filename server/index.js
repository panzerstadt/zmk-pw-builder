const { spawn, execSync } = require("child_process");
const express = require('express');
const cors = require("cors")
const fs = require("fs")
const app = express();
const port = process.env.PORT || 8080;

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
        console.log(`stdout: ${stdout}`);  // < --the uf2 should be hereeeee
        // under the name zmk.uf2
    });
}



const WHITELIST = [
    "http://localhost:3000",
    "https://polarity-works-lp-panzerstadt.vercel.app",
    "https://polarity-works-lp.vercel.app"
]

app.use(cors({
    origin: function (origin, callback) {
        if (WHITELIST.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error(`${origin} is Not allowed by CORS`))
        }
    }
}))
app.use(express.json())
app.post('/', async (req, res) => {
    await runBuildProcess(req, res, "bt60_v1", 'string');
})

app.post('/build', async (req, res) => {
    // receive json or keymap file here
    console.log("receiving these params")
    console.log(req.query)
    await runBuildProcess(req, res, "bt60_v1", 'file');
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
})

const runBuildProcess = async (req, res, board = "bt60_v1", type = "file") => {
    const timestamp = Date.now()
    const inputDir = `/keymap-config_${timestamp}`
    const outputDir = `/build_${timestamp}`
    const outputPath = outputDir + "/output/zephyr/zmk.uf2"

    const keymapAsString = req.body.keymapAsString

    execute(`mkdir ${inputDir}`)
    fs.writeFileSync(`${inputDir}/bt60.keymap`, keymapAsString, (err) => {
        if (err) {
            return console.warn(err)
        }
        console.log(`created file ${inputDir}/bt60.keymap`)
    })


    // FIXME: don't forget to delete the input and output dirs when done
    return new Promise((resolve) => {
        const build = spawn("west", ["build", "-d " + `${outputDir}/output`, "-s /zmk/app", "-b " + board, "--", "-DZMK_CONFIG=" + inputDir], { shell: true })

        build.on("close", code => {
            console.log(`child process exited with code ${code}`);
            if (code === 0) {
                // log 'ls for checking
                execute(`cd ${outputDir}/output/zephyr && ls`)

                // grab uf2 and send it on express
                const timestamp = Date.now()
                const filename = `bt60_${timestamp}.uf2`

                if (type === 'file') {
                    return res.download(outputPath, filename, (err) => {
                        if (err) return console.warn(err);
                        console.log(`${filename} has been sent!`);
                        resolve();
                    })
                }

                if (type === 'string') {
                    const filepath = outputPath
                    const stat = fs.statSync(filepath)

                    res.writeHead(200, {
                        "Content-Type": "application/octet-stream",
                        "Content-length": stat.size
                    })

                    const readStream = fs.createReadStream(filepath)
                    readStream.pipe(res).on('close', (err) => {
                        if (err) return console.warn(err);
                        console.log(`${filename} has been sent!`);

                        // cleanup
                        execute(`rm -rf ${inputDir}`)
                        execute(`rm -rf ${outputDir}`)
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
