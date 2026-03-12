import { marked } from 'marked';

marked.setOptions({
  gfm: true,
  breaks: true,
});

export function markdownToHtml(markdown: string): string {
  return marked.parse(markdown) as string;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function tagsToJson(tagsCsv: string): string {
  const tags = tagsCsv
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
  return JSON.stringify(tags);
}
