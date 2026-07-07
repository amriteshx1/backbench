import fs from "node:fs/promises";

function hasRegex(content, regex) {
  return regex.test(content);
}

async function main() {
  const targetPath = "src/webhook.ts";
  const content = await fs.readFile(targetPath, "utf8");

  const checks = [
    {
      id: "no_todo",
      passed: !content.toLowerCase().includes("todo"),
      message: "Solution should not contain TODO markers.",
    },
    {
      id: "uses_hmac",
      passed: hasRegex(content, /createHmac/s),
      message: "Expected crypto.createHmac.",
    },
    {
      id: "returns_401",
      passed: hasRegex(content, /status\(\s*401\s*\)/s),
      message: "Expected HTTP 401 on bad signature.",
    }
  ];

  const passedTests = checks.filter((check) => check.passed).length;
  const totalTests = checks.length;
  const failedChecks = checks.filter((check) => !check.passed);
  const status = passedTests === totalTests ? "PASSED" : "FAILED";
  const score = Math.round((passedTests / totalTests) * 100);

  const result = {
    status,
    score,
    passedTests,
    totalTests,
    errorType: status === "FAILED" ? "ASSERTION_FAILED" : null,
    errorMessage:
      status === "FAILED"
        ? `Failed checks: ${failedChecks.map((check) => check.id).join(", ")}`
        : null,
    testResultsJson: { checks },
    durationMs: 40,
    memoryMb: 16,
  };

  console.log(`RESULT_JSON:${JSON.stringify(result)}`);
}

main().catch((error) => {
  const result = {
    status: "ERROR",
    score: 0,
    passedTests: 0,
    totalTests: 0,
    errorType: "HIDDEN_TEST_RUNTIME_ERROR",
    errorMessage: error instanceof Error ? error.message : "Unknown hidden test error",
    testResultsJson: null,
    durationMs: null,
    memoryMb: null,
  };
  console.error("Hidden test runtime error:", error);
  console.log(`RESULT_JSON:${JSON.stringify(result)}`);
  process.exitCode = 0;
});
