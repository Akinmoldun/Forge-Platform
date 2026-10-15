import fs from "fs";
import path from "path";

// Let's audit all <Link>, navigate(), href, and routes in the codebase
function findFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== "convex" && file !== "node_modules" && file !== "_generated" && file !== "dist" && file !== "build") {
        findFiles(fullPath, fileList);
      }
    } else if (file.endsWith(".ts") || file.endsWith(".tsx")) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

const files = findFiles(path.resolve("src"));

console.log("=== Auditing all navigation targets in src/ ===");

const linkRegex = /<Link[^>]+to=\{?["'`]([^"'`]+)["'`]\}?/g;
const navigateRegex = /navigate\(\s*["'`]([^"'`]+)["'`]/g;

const routesFound = new Set<string>();

for (const file of files) {
  const content = fs.readFileSync(file, "utf-8");
  let m;
  while ((m = linkRegex.exec(content)) !== null) {
    routesFound.add(m[1]);
  }
  while ((m = navigateRegex.exec(content)) !== null) {
    routesFound.add(m[1]);
  }
}

console.log("Found navigation paths:");
for (const r of Array.from(routesFound).sort()) {
  console.log("  ->", r);
}
