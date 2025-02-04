import { useState } from "react";
import "./CodeRunner.css";
import axios from "axios";

function CodeRunner() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCodeChange = (event) => {
    setCode(event.target.value);
  };

  const handleLanguageChange = (event) => {
    setLanguage(event.target.value);
  };

  const handleRunCode = async () => {
    setLoading(true);
    setOutput("Executing...");

    try {
      const response = await axios.post(
        "http://localhost:3001/v1/docker/execute",
        {
          language,
          code,
        }
      );
      const { taskId } = response.data;
      if (!taskId) {
        setOutput("Failed to get task ID.");
        setLoading(false);
        return;
      }

      // Polling function to get execution result
      const pollResult = async () => {
        try {
          const resultResponse = await axios.get(
            `http://localhost:3001/v1/docker/result/${taskId}`
          );
          if (resultResponse.data.status === "completed") {
            setOutput(resultResponse.data.output);
            setLoading(false);
          } else {
            setTimeout(pollResult, 2000); // Poll every 2 seconds
          }
        } catch (error) {
          setOutput("Error fetching execution result.");
          setLoading(false);
        }
      };

      pollResult();
    } catch (error) {
      setOutput(
        `Error: ${error.response?.data?.error || "Failed to execute code"}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="code-runner">
      <h1>Code Execution API</h1>
      <textarea
        value={code}
        onChange={handleCodeChange}
        placeholder="Write your code here.."
      />
      <div className="controls">
        <select value={language} onChange={handleLanguageChange}>
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">Cpp</option>
          <option value="c">C</option>
        </select>
        <button onClick={handleRunCode} disabled={loading}>
          Run
        </button>
      </div>
      <div className="output">{output}</div>
    </div>
  );
}

export default CodeRunner;
