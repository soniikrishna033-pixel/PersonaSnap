import { defineConfig } from 'vite';
import { resolve, dirname, relative, join } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function getHtmlFiles(dir, fileList = {}) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === 'node_modules' || file === 'dist' || file.startsWith('.')) continue;
    const filePath = join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getHtmlFiles(filePath, fileList);
    } else if (file.endsWith('.html')) {
      let name = relative(__dirname, filePath).replace(/\.html$/, '').replace(/\\/g, '/');
      if (name === 'index') name = 'main';
      fileList[name] = resolve(__dirname, filePath);
    }
  }
  return fileList;
}

export default defineConfig({
  build: {
    rollupOptions: {
      input: getHtmlFiles(__dirname)
    }
  }
});
