# LLM-Pen Architecture

## Overview

LLM-Pen is a web-based application built with Vue.js and Vite that allows users to interact with AI language models (both OpenAI and locally hosted Ollama models) to generate and modify HTML, CSS, and JavaScript code in real-time. The application features a chat interface where users can describe their desired web page or application, and the AI will generate or modify code in an integrated editor.

## Technology Stack

- **Frontend Framework**: Vue.js 3 (Composition API)
- **Build Tool**: Vite
- **State Management**: Pinia
- **Styling**: CSS with scoped styles
- **Markdown Processing**: Marked.js
- **Deployment**: GitHub Pages

## Project Structure

```
llm-pen/
├── src/
│   ├── api/              # API clients for OpenAI and Ollama
│   ├── assets/           # Static assets (images, icons)
│   ├── components/       # Vue components
│   ├── constants/        # System prompts and tool definitions
│   ├── stores/           # Pinia stores for state management
│   ├── views/            # Top-level view components
│   ├── App.vue           # Root Vue component
│   └── main.js           # Application entry point
├── docs/                 # Built application (GitHub Pages deployment target)
├── screenshots/          # Documentation images
├── index.html            # HTML entry point
├── vite.config.js        # Vite configuration
├── package.json          # Project dependencies and scripts
└── README.md             # Project documentation
```

## Core Components

### 1. Main Application (App.vue)
The root component that renders the HomeView and sets up global styles.

### 2. Home View (views/HomeView.vue)
The primary view that orchestrates the application layout:
- Chat section for interacting with AI models
- Editor section for viewing and modifying code
- Output section for previewing the rendered web page

### 3. Components

#### Chat Components
- **ServiceSelect.vue**: Allows users to choose between OpenAI, Ollama, Google Gemini, and llama.cpp models
- **LocalModelSelect.vue**: Model selector for Ollama when local service is chosen
- **OpenAIKeyInput.vue**: Input field for OpenAI API key
- **GeminiKeyInput.vue**: Input field for Google Gemini API key
- **GeminiModelSelect.vue**: Model selector for Google Gemini models
- **LlamaCppModelSelect.vue**: Model selector for llama.cpp models
- **ChatMessages.vue**: Displays the conversation history with visual backend indicators and streaming support
- **ChatInput.vue**: Input field for user messages

#### Editor Components
- **EditorSection.vue**: Provides editable panes for HTML, CSS, and JavaScript
- **OutputSection.vue**: Renders the combined code in an iframe for preview

### 4. State Management (Pinia Stores)

#### Service Store (stores/serviceStore.js)
Manages:
- Selected service (OpenAI or local)
- API keys and model selection
- Chat message history
- API status and loading states
- Function call handling for code modifications

#### Editor Store (stores/editorStore.js)
Manages:
- HTML, CSS, and JavaScript code content
- Functions for replacing or updating code sections
- Code merging for iframe preview

### 5. API Clients

#### OpenAI Client (api/openai.js)
Handles communication with OpenAI's chat completions API, including:
- Request formatting with system prompt and conversation history
- Function calling for code modifications
- Error handling

#### Ollama Client (api/ollama.js)
Handles communication with local Ollama instances, including:
- Requests to localhost:11434
- Tool calling implementation
- Error handling

#### Google Gemini Client (api/gemini.js)
Handles communication with Google's Gemini API, including:
- Requests using the official `@google/generative-ai` SDK
- Streaming response support
- Function calling for code modifications
- Error handling with specific error types

#### llama.cpp Client (api/llamaCpp.js)
Handles communication with locally hosted llama.cpp models, including:
- Requests to localhost:8080 (OpenAI-compatible API)
- Function calling for code modifications
- Error handling for common connection issues

### 6. Constants

#### System Prompt (constants/systemPrompt.js)
Generates dynamic system prompts that include the current code state, providing context to the AI models.

#### Tools (constants/tools.js)
Defines the available functions that AI models can call:
- `replaceCode`: Replaces entire sections of code
- `updateCodePart`: Updates specific parts of code sections

## Data Flow

1. User selects AI service (OpenAI or local Ollama)
2. User sends a message through the chat interface
3. Service store formats the request with:
   - Current code state (from editor store)
   - Conversation history
   - System prompt with current code
   - Available functions/tools
4. Request is sent to the selected API (OpenAI or Ollama)
5. AI response is processed:
   - Text responses are added to chat history
   - Function calls are executed to modify code
6. Code changes are reflected in the editor and preview sections
7. Updated code state is sent in subsequent requests

## Key Features

### Multi-Backend AI Support
- OpenAI integration via API key
- Local Ollama support for offline usage
- Google Gemini integration via API key
- Local llama.cpp support for offline usage

### Real-time Code Editing
- Split-pane editor for HTML, CSS, and JavaScript
- Live preview of generated web pages
- Function-based code modification

### Function Calling
- AI models can directly modify code through predefined functions
- Four functions available: full section replacement, partial updates, code insertion, and code deletion
- Streaming responses for real-time feedback (Google Gemini)
- Visual indicators for backend identification

### Responsive Design
- Flexible layout that adapts to different screen sizes
- Toggleable editor section for focused preview

## Build and Deployment

- Development server: `npm run dev`
- Production build: `npm run build` (outputs to `/docs` for GitHub Pages)
- Preview build: `npm run preview`

The application is designed to run entirely in the browser with no backend requirements, making it suitable for GitHub Pages deployment.