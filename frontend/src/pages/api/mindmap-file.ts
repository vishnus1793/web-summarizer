import fs from 'fs';
import path from 'path';
import type { NextApiRequest, NextApiResponse } from 'next';

const SCRAPED_DATA_PATH = '/home/vishnu/Pictures/mindmap_project/scraped_data';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { name } = req.query;
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Missing file name' });
  }

  const filePath = path.join(SCRAPED_DATA_PATH, name);
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    res.status(200).json(JSON.parse(data));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to read JSON file' });
  }
}
