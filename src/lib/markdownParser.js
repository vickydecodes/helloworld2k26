/**
 * Simple browser-safe YAML Frontmatter Parser
 * Returns an object: { data: Record<string, string>, content: string }
 */
export function parseFrontmatter(text) {
  if (!text) return { data: {}, content: '' };
  
  const trimmedText = text.trim();
  if (!trimmedText.startsWith('---')) {
    return { data: {}, content: text };
  }
  
  // Find the closing --- marker (skipping the first one)
  const closeMarkerIndex = trimmedText.indexOf('---', 3);
  if (closeMarkerIndex === -1) {
    return { data: {}, content: text };
  }
  
  const yamlBlock = trimmedText.slice(3, closeMarkerIndex).trim();
  const content = trimmedText.slice(closeMarkerIndex + 3).trim();
  
  const data = {};
  const lines = yamlBlock.split(/\r?\n/);
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('#')) continue;
    
    const colonIndex = trimmedLine.indexOf(':');
    if (colonIndex === -1) continue;
    
    const key = trimmedLine.slice(0, colonIndex).trim();
    let val = trimmedLine.slice(colonIndex + 1).trim();
    
    // Remove wrapping single or double quotes
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    
    data[key] = val;
  }
  
  return { data, content };
}

// Dynamically glob all markdown files in src/content/events/
// Eager loading imports them as string content when query is ?raw
const mdModules = import.meta.glob('../content/events/*.md', { query: '?raw', eager: true });

/**
 * Retrieves all events dynamically auto-detected from the markdown directory.
 */
export function getAutoDetectedEvents() {
  const detected = [];
  
  for (const path in mdModules) {
    // Resolve content (Vite's ?raw import default exports the raw string)
    const rawContent = mdModules[path].default || mdModules[path];
    if (typeof rawContent !== 'string') continue;
    
    const { data, content } = parseFrontmatter(rawContent);
    
    // Extract filename/slug
    // e.g. ../content/events/web-development.md -> web-development
    const filename = path.split('/').pop() || '';
    const id = filename.replace('.md', '');
    
    detected.push({
      id: data.id || id,
      name: data.name || id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      phone: data.phone || '',
      content,
      rawContent,
      frontmatter: data
    });
  }
  
  return detected;
}

/**
 * Retrieves a single auto-detected event by ID.
 */
export function getEventById(eventId) {
  const events = getAutoDetectedEvents();
  return events.find(e => e.id === eventId) || null;
}
