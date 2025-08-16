# LLM-Pen Enhancement Plan

## Overview
This document outlines the tasks required to enhance LLM-Pen with support for additional LLM backends (Google Gemini API and llama.cpp) and improved coding functions.

## Phase 1: Add Google Gemini API Support

### Task 1: Create Google Gemini API Client
- Create `src/api/gemini.js`
- Implement function to send chat requests to Google Gemini API
- Handle authentication with API key
- Process responses in Gemini format
- Add proper error handling
- [x] Completed

### Task 2: Update Service Selection
- Modify `src/components/ServiceSelect.vue` to include "Google Gemini" option
- Update styling if needed to accommodate new option
- [x] Completed

### Task 3: Add Google Gemini Key Input
- Create `src/components/GeminiKeyInput.vue` component
- Implement secure input field for Gemini API key
- Add validation for API key format
- [x] Completed

### Task 4: Extend Service Store for Gemini
- Update `src/stores/serviceStore.js`
- Add handling for Gemini service selection
- Implement `handleGeminiRequest()` method
- Add proper response processing for Gemini format
- [x] Completed

### Task 5: Update UI Logic
- Modify `src/views/HomeView.vue` to conditionally render GeminiKeyInput
- Add proper conditional rendering logic
- [x] Completed

## Phase 2: Add llama.cpp Support

### Task 1: Create llama.cpp API Client
- Create `src/api/llamaCpp.js`
- Implement function to send chat requests to llama.cpp server
- Handle communication with localhost endpoint
- Process responses in llama.cpp format
- Add proper error handling
- [x] Completed

### Task 2: Update Service Selection
- Modify `src/components/ServiceSelect.vue` to include "llama.cpp" option
- [x] Completed

### Task 3: Add llama.cpp Model Selection
- Create `src/components/LlamaCppModelSelect.vue` component
- Implement model selection for locally hosted models
- Add refresh functionality to detect available models
- [x] Completed

### Task 4: Extend Service Store for llama.cpp
- Update `src/stores/serviceStore.js`
- Add handling for llama.cpp service selection
- Implement `handleLlamaCppRequest()` method
- Add proper response processing for llama.cpp format
- [x] Completed

### Task 5: Update UI Logic
- Modify `src/views/HomeView.vue` to conditionally render LlamaCppModelSelect
- Add proper conditional rendering logic
- [x] Completed

## Phase 3: Refine Available Functions for LLM Coding Capabilities

### Task 1: Analyze Current Functions
- Review existing `replaceCode` and `updateCodePart` functions
- Identify limitations in current implementation
- Document use cases where current functions are insufficient
- [x] Completed

### Task 2: Design Enhanced Function Set
- Define new functions for:
  - `insertCodeAtPosition`: Insert code at specific line/column
  - `deleteCodeBlock`: Remove specific code sections
  - `wrapWithElement`: Wrap existing code with new HTML elements
  - `addLibrary`: Add external libraries (CDN links)
  - `modifyAttribute`: Modify HTML attributes
  - `addEventListeners`: Add JavaScript event listeners
- Define function parameters and return values
- Create detailed documentation for each function
- [x] Partially completed (implemented `insertCodeAtPosition` and `deleteCodeBlock`)

### Task 3: Implement New Functions in Editor Store
- Update `src/stores/editorStore.js`
- Add implementations for new functions
- Ensure proper error handling and validation
- Add logging for debugging purposes
- [x] Completed (for `insertCodeAtPosition` and `deleteCodeBlock`)

### Task 4: Update Tools Definition
- Modify `src/constants/tools.js`
- Add definitions for new functions
- Maintain compatibility with existing functions
- Update function descriptions and parameters
- [x] Completed (for `insertCodeAtPosition` and `deleteCodeBlock`)

### Task 5: Update System Prompt
- Modify `src/constants/systemPrompt.js`
- Include documentation for new functions
- Provide clear examples of when to use each function
- Optimize prompt for better function selection
- [x] Completed (for `insertCodeAtPosition` and `deleteCodeBlock`)

### Task 6: Update Function Call Handling
- Update `src/stores/serviceStore.js`
- Extend `handleFunctionCall()` to support new functions
- Add proper mapping between function names and implementations
- Implement fallback for unknown functions
- [x] Completed (for `insertCodeAtPosition` and `deleteCodeBlock`)

## Phase 4: UI/UX Enhancements

### Task 1: Implement Streaming Responses
- Add streaming support for Google Gemini in the UI
- Create visual indicators for streaming status
- [x] Completed

### Task 2: Add Visual Backend Indicators
- Create colored badges to show selected backend
- Implement distinct colors for each backend
- [x] Completed

### Task 3: Enhance Error Handling
- Improve error messages with specific guidance
- Add contextual suggestions for resolving issues
- [x] Completed

### Task 4: Update Documentation
- Update README.md with new UI features
- Update ARCHITECTURE.md with UI component descriptions
- [x] Completed

## Phase 5: Testing and Integration

### Task 1: Test Google Gemini Integration
- Test API communication with various models
- Verify function calling capabilities
- Test error handling scenarios
- Validate response processing

### Task 2: Test llama.cpp Integration
- Test communication with local llama.cpp server
- Verify model selection functionality
- Test function calling with local models
- Validate response processing

### Task 3: Cross-backend Compatibility Testing
- Ensure consistent behavior across all backends
- Test function calling consistency
- Validate error handling across backends
- Check performance characteristics

### Task 4: Enhanced Functions Testing
- Test each new function with various inputs
- Verify edge cases are handled properly
- Test function combinations
- Validate code integrity after function calls

### Task 5: UI/UX Testing
- Verify all new UI components work correctly
- Test responsive design with new elements
- Validate user flows for new backends
- Check accessibility considerations

## Phase 6: Documentation and Deployment

### Task 1: Update README.md
- Document new backend support
- Add setup instructions for Google Gemini and llama.cpp
- Update screenshots if necessary
- Add information about new functions
- [x] Updated with UI enhancements

### Task 2: Update ARCHITECTURE.md
- Document new backend integrations
- Update component descriptions
- Add information about enhanced functions
- [x] Updated with new components and features

### Task 3: Create Usage Examples
- Develop example prompts that showcase new functions
- Create tutorials for each backend
- Document best practices for function usage

### Task 4: Final Testing
- End-to-end testing of all features
- Performance testing
- Cross-browser compatibility testing
- User acceptance testing

## Timeline and Dependencies

### Dependencies:
- Google Gemini API access for development and testing
- llama.cpp server running locally for development and testing
- Existing OpenAI and Ollama setups for regression testing

### Suggested Implementation Order:
1. Google Gemini API support (foundational for cloud-based APIs)
2. llama.cpp support (different architecture for local models)
3. Enhanced functions implementation (can be developed in parallel)
4. UI/UX enhancements
5. Integration and testing of all components
6. Documentation updates

## Risk Assessment

### Technical Risks:
- API rate limits for Google Gemini
- Local server availability for llama.cpp
- Differences in function calling implementations across backends
- Performance issues with larger context windows
- Browser compatibility issues with streaming responses

### Mitigation Strategies:
- Implement proper error handling and retry mechanisms
- Provide clear user guidance for local setup
- Create abstraction layers for backend-specific implementations
- Add performance monitoring and optimization
- Test streaming functionality across different browsers