import fs from "fs";
import path from "path";

// Let's write a comprehensive checker
function findFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== "convex" && file !== "node_modules" && file !== "_generated") {
        findFiles(fullPath, fileList);
      }
    } else if (file.endsWith(".ts") || file.endsWith(".tsx")) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

const frontendFiles = findFiles(path.resolve("src"));

const apiCalls: Array<{ file: string; line: number; call: string; context: string }> = [];

for (const filePath of frontendFiles) {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/api\.([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)/);
    if (match) {
      const start = Math.max(0, i - 2);
      const end = Math.min(lines.length, i + 8);
      const context = lines.slice(start, end).join("\n");
      apiCalls.push({
        file: path.relative(process.cwd(), filePath),
        line: i + 1,
        call: match[0],
        context,
      });
    }
  }
}

console.log(`Total API call sites found: ${apiCalls.length}\n`);

// Print details for each
for (const call of apiCalls) {
  console.log(`--- [${call.file}:${call.line}] ${call.call} ---`);
  console.log(call.context);
  console.log();
}
