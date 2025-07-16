# AI Task Analyser

This is a Next.js application that helps users analyze their tasks and performance based on a predefined framework. The application uses the Gemini API to provide structured feedback on user input.

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## How It Works

The application uses a "Task Framework" defined in `context.md` to analyze user input. The user can describe a task-related problem or a moment of praise in the text area. The application then sends the input to the Gemini API, which returns a structured analysis based on the framework.

### Features

-   **Task Analysis:** Get structured feedback on your tasks and performance.
-   **Praise Analysis:** Recognize and appreciate the positive contributions of your team members.
-   **Copy to Clipboard:** Easily copy individual fields from the analysis results.
-   **Toast Notifications:** Get instant feedback when you copy a field to the clipboard.

## Customization

To customize the task framework, edit the `context.md` file. The application will automatically update the analysis prompt based on the content of this file.