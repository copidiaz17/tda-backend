import fs from 'fs';
import path from 'path';

export async function extraerTexto(filePath, originalName) {
  const ext = path.extname(originalName).toLowerCase();

  if (ext === '.pdf') {
    const pdfParse = (await import('pdf-parse')).default;
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    return data.text;
  }

  if (ext === '.docx') {
    const mammoth = await import('mammoth');
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  }

  if (ext === '.doc') {
    const WordExtractor = (await import('word-extractor')).default;
    const extractor = new WordExtractor();
    const doc = await extractor.extract(filePath);
    return doc.getBody();
  }

  if (ext === '.txt') {
    return fs.readFileSync(filePath, 'utf-8');
  }

  return null;
}
