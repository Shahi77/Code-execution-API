const redisQueue = require("../service/redis");
const Docker = require("dockerode");
const path = require("path");
const fs = require("fs");

const docker = new Docker();

const processQueue = async () => {
  console.log("Worker started, waiting for tasks...");
  while (true) {
    const task = await redisQueue.consumeFromQueue("code_execution_queue");
    if (!task) continue;

    const { language, code } = task;
    let imageName, extension, command, fileName;

    try {
      console.log(`Processing task: ${JSON.stringify(task)}`);

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
        case "java":
          imageName = "openjdk:slim";
          extension = "java";

          // Extract the public class name from the Java code
          const classNameMatch = code.match(
            /public\s+class\s+([a-zA-Z_][a-zA-Z0-9_]*)/
          );
          if (!classNameMatch) {
            return res
              .status(400)
              .json({ error: "Invalid Java code. Missing public class." });
          }
          fileName = classNameMatch[1]; // Use the class name as the file name
          command = [
            "sh",
            "-c",
            `javac /app/${fileName}.java && java -cp /app ${fileName}`,
          ];
          break;
        default:
          return res.status(400).json({ error: "Unsupported language" });
      }

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

      let output = "";
      try {
        const stream = await container.logs({
          stdout: true,
          stderr: true,
          follow: true,
        });

        for await (const chunk of stream) {
          output += chunk.toString("utf8");
        }
      } catch (logError) {
        console.error("Error fetching container logs:", logError.message);
        throw new Error("Failed to retrieve logs.");
      }
      //   try {
      //     const stream = await container.logs({
      //       stdout: true,
      //       stderr: true,
      //       follow: true,
      //     });

      //     let output = "";
      //     stream.on("data", (chunk) => {
      //       output += chunk.toString("utf8");
      //     });

      //     stream.on("end", () => {
      //       console.log("Execution Output (Stream):", output.trim());
      //       res.json({ output: output.trim() });
      //     });

      //     stream.on("error", (err) => {
      //       console.error("Error reading logs stream:", err.message);
      //       res.status(500).json({
      //         error: "Failed to read logs",
      //         details: err.message,
      //       });
      //     });
      //   } catch (error) {
      //     console.error("Error fetching container logs:", error.message);
      //     res.status(500).json({
      //       error: "Failed to retrieve logs",
      //       details: error.message,
      //     });
      //   }

      // Cleanup
      await container.stop();
      await container.remove();
      fs.unlinkSync(codePath);

      // Store execution result in Redis
      const resultKey = `execution_result:${new Date().getTime()}`;
      await redisQueue.redisClient.set(
        resultKey,
        JSON.stringify({ output: output.trim() }),
        "EX",
        3600 // Expires in 1 hour
      );
      console.log(`Execution completed. Result stored at key: ${resultKey}`);
    } catch (error) {
      console.error("Error processing task:", error.message);

      // Store error result in Redis
      const errorKey = `execution_error:${new Date().getTime()}`;
      await redisQueue.redisClient.set(
        errorKey,
        JSON.stringify({ error: error.message }),
        "EX",
        3600 // Expires in 1 hour
      );
      console.log(`Error stored at key: ${errorKey}`);
    }
  }
};
processQueue();
