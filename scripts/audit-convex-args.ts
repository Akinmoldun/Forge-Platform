import fs from "fs";
import path from "path";

// Recursively find all ts/tsx files in src/ (excluding src/convex)
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

console.log(`Found ${frontendFiles.length} frontend files to audit.`);

// Find all matches for api.<module>.<func>
const apiCallRegex = /api\.([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)/g;
const usages = new Map<string, Array<{ file: string; line: number; snippet: string }>>();

for (const filePath of frontendFiles) {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let match;
    while ((match = apiCallRegex.exec(line)) !== null) {
      const key = `${match[1]}.${match[2]}`;
      if (!usages.has(key)) usages.set(key, []);
      usages.get(key)!.push({
        file: path.relative(process.cwd(), filePath),
        line: i + 1,
        snippet: line.trim(),
      });
    }
  }
}

console.log(`Found ${usages.size} unique Convex API functions called from frontend:\n`);

for (const [key, callSites] of Array.from(usages.entries()).sort()) {
  console.log(`=== ${key} (${callSites.length} call sites) ===`);
  for (const site of callSites) {
    console.log(`  ${site.file}:${site.line} -> ${site.snippet.slice(0, 100)}`);
  }
}
