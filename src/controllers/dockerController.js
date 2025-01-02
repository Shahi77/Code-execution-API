const Docker = require("dockerode");
const fs = require("fs");
const docker = new Docker();

const executeCode = async (req, res) => {
  const { language, code } = req.body;

  if (!language || !code) {
    return res.status(400).json({ error: "Language and code are required" });
  }

  let imageName;
  if (language === "python") {
    imageName = "python:3.9-slim"; //Python image
  } else {
    return res.status(400).json({ error: "Unsupported language" });
  }

  try {
    // Write code to a temporary file
    const codePath = `${__dirname}/temp_code.py`;
    fs.writeFileSync(codePath, code);

    // Create and start Docker container
    const container = await docker.createContainer({
      Image: imageName,
      Tty: false,
      Cmd: ["python", "/app/temp_code.py"],
      HostConfig: {
        Binds: [`${__dirname}:/app`], // Bind temp directory
      },
    });

    await container.start();

    const logs = await container.logs({
      stdout: true,
      stderr: true,
    });

    res.json({ output: logs.toString() });

    // Cleanup
    await container.stop();
    await container.remove();
    fs.unlinkSync(codePath); // Remove temp file
  } catch (error) {
    res.status(500).json({ error: "Execution failed", details: error.message });
  }
};

module.exports = { executeCode };
