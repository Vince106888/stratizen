import { execFileSync } from "node:child_process";

const patterns = [
  { name: "Private key block", regex: /-----BEGIN [A-Z ]*PRIVATE KEY-----/g },
  { name: "AWS access key", regex: /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/g },
  { name: "GitHub token", regex: /\bghp_[A-Za-z0-9]{36}\b/g },
  { name: "GitHub fine-grained token", regex: /\bgithub_pat_[A-Za-z0-9_]{80,}\b/g },
  { name: "Slack token", regex: /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/g },
  { name: "Firebase API key", regex: /\bAIza[0-9A-Za-z_-]{35}\b/g },
];

const stagedFiles = execFileSync(
  "git",
  ["diff", "--cached", "--name-only", "--diff-filter=ACMR"],
  { encoding: "utf8" }
)
  .split(/\r?\n/)
  .map((s) => s.trim())
  .filter(Boolean);

if (stagedFiles.length === 0) {
  process.exit(0);
}

const findings = [];

for (const file of stagedFiles) {
  let content;
  try {
    content = execFileSync("git", ["show", `:${file}`], {
      encoding: "utf8",
      maxBuffer: 10 * 1024 * 1024,
    });
  } catch {
    continue;
  }

  for (const pattern of patterns) {
    pattern.regex.lastIndex = 0;
    const match = pattern.regex.exec(content);
    if (match) {
      findings.push({ file, name: pattern.name, sample: match[0] });
    }
  }
}

if (findings.length > 0) {
  console.error("Potential secret(s) detected in staged changes:");
  for (const finding of findings) {
    console.error(`- ${finding.file}: ${finding.name} (${finding.sample.slice(0, 24)}...)`);
  }
  console.error("Commit blocked. Move secrets to environment variables before committing.");
  process.exit(1);
}
