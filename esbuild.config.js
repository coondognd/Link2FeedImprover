// esbuild.config.js
const esbuild = require("esbuild");
const fs = require("fs-extra");
const path = require("path");

// ===== CONFIG =====
const SRC = "src";
const DIST = "dist";

// Files to copy every build
const STATIC_FILES = [
  "manifest.json",
  "pdf.worker.js",
  "images",
  "pdfs",
  "scripts/background.js",
  "scripts/checkin.js",
  "scripts/create.js",
  "scripts/search.js",
];

// ===== STATIC FILE COPYING =====
function copyStatic() {
  for (const file of STATIC_FILES) {
    const srcPath = path.join(SRC, file);
    const distPath = path.join(DIST, file);

    if (fs.existsSync(srcPath)) {
      fs.copySync(srcPath, distPath);
      console.log("Copied:", file);
    }
  }
}

// ===== ESBUILD SETTINGS =====
const buildOptions = {
  entryPoints: {
    //background: `${SRC}/background.js`,
    "print_pdf.bundle": `${SRC}/scripts/print_pdf.js`
  },
  outdir: `${DIST}/scripts`,
  bundle: true,
  format: "iife",
  sourcemap: "inline",
  // Allow window.__globals
  globalName: "__EXTENSION",
  target: ["chrome120"],
  logLevel: "info"
};

// ===== WATCH MODE? =====
const isWatch = process.argv.includes("--watch");

async function build() {
  copyStatic();

  if (isWatch) {
    console.log("Watching for changes…");

    const ctx = await esbuild.context(buildOptions);
    await ctx.watch();

    console.log("Initial build complete.");
  } else {
    await esbuild.build(buildOptions);
    console.log("Build complete.");
  }
}

build();
