// Optional asset regeneration: npm install --no-save sharp
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const sharp=require(process.env.SHARP_MODULE||'sharp');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const svg=fs.readFileSync(path.join(root,'assets/icon.svg'));
for(const [name,size]of [['icon-192.png',192],['icon-512.png',512],['maskable-512.png',512],['apple-touch-icon.png',180]])await sharp(svg).resize(size,size).png().toFile(path.join(root,'icons',name));
