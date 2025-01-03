const Docker = require("dockerode");
const path = require("path");
const fs = require("fs");

const docker = new Docker();
const executeCode = async (req, res) => {
  const { language, code } = req.body;

  if (!language || !code) {
    return res.status(400).json({ error: "Language and code are required" });
  }

  let imageName, extension, command, fileName;
  switch (language.toLowerCase()) {
    case "python":
      imageName = "python:3.9-slim";
      extension = "py";
      fileName = "temp_code";
      command = ["python", `/app/${fileName}.${extension}`];
      break;
    case "javascript":
      imageName = "node:slim";
      extension = "js";
      fileName = "temp_code";
      command = ["node", `/app/${fileName}.${extension}`];
      break;
    case "c":
      imageName = "gcc:latest";
      extension = "c";
      fileName = "temp_code";
      command = [
        "sh",
        "-c",
        `gcc /app/${fileName}.c -o /app/${fileName} && /app/${fileName}`,
      ];
      break;
    case "cpp":
      imageName = "gcc:latest";
      extension = "cpp";
      fileName = "temp_code";
      command = [
        "sh",
        "-c",
        `g++ /app/${fileName}.cpp -o /app/${fileName} && /app/${fileName}`,
      ];
      break;

    default:
      return res.status(400).json({ error: "Unsupported language" });
  }

  try {
    // Ensure temp directory exists
    const tempDir = path.join(__dirname, "../temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    const codePath = path.join(tempDir, `${fileName}.${extension}`);

    // Write code to a temporary file
    console.log("Writing code to:", codePath);
    fs.writeFileSync(codePath, code);
    console.log("Code written successfully");

    // Docker execution
    const container = await docker.createContainer({
      Image: imageName,
      Tty: false,
      Cmd: command,
      HostConfig: {
        Binds: [`${tempDir}:/app`], // Bind temp directory
      },
    });

    await container.start();

    try {
      const stream = await container.logs({
        stdout: true,
        stderr: true,
        follow: true,
      });

      let output = "";
      stream.on("data", (chunk) => {
        output += chunk.toString("utf8");
      });

      stream.on("end", () => {
        console.log("Execution Output (Stream):", output.trim());
        res.json({ output: output.trim() });
      });

      stream.on("error", (err) => {
        console.error("Error reading logs stream:", err.message);
        res.status(500).json({
          error: "Failed to read logs",
          details: err.message,
        });
      });
    } catch (error) {
      console.error("Error fetching container logs:", error.message);
      res.status(500).json({
        error: "Failed to retrieve logs",
        details: error.message,
      });
    }

    // Cleanup
    await container.stop();
    await container.remove();
    fs.unlinkSync(codePath); // Delete the temp file
  } catch (error) {
    console.error("Error during code execution:", error.message);
    res.status(500).json({ error: "Execution failed", details: error.message });
  }
};

module.exports = { executeCode };
