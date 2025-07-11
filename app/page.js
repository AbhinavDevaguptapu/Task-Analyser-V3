import fs from 'fs/promises';
import path from 'path';
import TaskAnalysisClient from './components/TaskAnalysisClient';

/**
 * Parses the markdown content from context.md into a structured object.
 * This function runs on the server.
 * @param {string} mdContent - The raw string content from the context.md file.
 * @returns {object} A structured framework map.
 */
function parseFramework(mdContent) {
  const framework = {};
  // UPDATED: This regex is more robust. It splits by the heading syntax
  // without being dependent on specific line endings or whitespace.
  const sections = mdContent.split(/###\s*\*{2,3}(.*?)\*{2,3}/);

  // The first element of the split is anything before the first heading, so we skip it.
  for (let i = 1; i < sections.length; i += 2) {
    // The captured group (the heading title) is at index `i`.
    const category = sections[i].trim().toLowerCase();
    // The content following the heading is at index `i + 1`.
    const content = sections[i + 1];

    if (!content) continue;

    // UPDATED: This regex is more robust for finding list items.
    // It handles various indentations with normal or non-breaking spaces.
    const subPoints = content.match(/^[ \u00A0]*\*[ \u00A0](.*)/gm) || [];

    // Cleans up each list item.
    framework[category] = subPoints.map(sp =>
      sp.trim()
        .replace(/^\*[ \u00A0]/, '') // Remove only the leading bullet point
        .replace(/\(.*\)/g, '')    // Remove content in parentheses
        .trim()
    ).filter(Boolean); // Filter out any empty strings that might result.
  }

  if (Object.keys(framework).length === 0) {
    console.warn("Warning: The parseFramework function could not find any categories in context.md. The file might be empty or formatted incorrectly.");
  }

  return framework;
}

/**
 * Reads and parses the context.md file from the project root.
 * @returns {Promise<object>} The parsed framework map.
 */
async function getFrameworkMap() {
  try {
    // Construct the full path to the context.md file.
    const filePath = path.join(process.cwd(), 'context.md');
    const mdContent = await fs.readFile(filePath, 'utf-8');
    return parseFramework(mdContent);
  } catch (error) {
    console.error("Error reading or parsing context.md:", error);
    // Fallback to an empty object if the file can't be read.
    return {};
  }
}

// This is the main page component. It's a Server Component by default.
export default async function Page() {
  // It fetches the data on the server before rendering.
  const frameworkMap = await getFrameworkMap();

  // It then passes the fetched data as a prop to the client component.
  return <TaskAnalysisClient frameworkMap={frameworkMap} />;
}
