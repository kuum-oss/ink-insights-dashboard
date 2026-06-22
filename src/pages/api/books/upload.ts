import formidable from 'formidable';
import fs from 'fs';
import { resolve } from 'path';
import type { NextApiRequest, NextApiResponse } from 'next';

export const config = { api: { bodyParser: false } };

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const form = new formidable.IncomingForm();
  form.parse(req, (err, fields, files) => {
    if (err) return res.status(500).json({ error: err.message });
    const file: any = files.file || files.upload || null;
    if (!file) return res.status(400).json({ error: 'No file' });
    const filepath = file.filepath || file.path;
    const filename = `${Date.now()}-${file.originalFilename || file.name}`;
    const uploadsDir = resolve(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
    const dest = resolve(uploadsDir, filename);
    try {
      fs.copyFileSync(filepath, dest);
      const urlPath = `/uploads/${filename}`;
      return res.status(201).json({ url: urlPath });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  });
}
