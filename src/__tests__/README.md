# Testing VulLink Visualizer

This directory contains tests for the VulLink Visualizer application. The tests are organized in a structure that mirrors the main src directory.

## Running Tests

To run all tests:

```bash
npm test
```

To run a specific test file:

```bash
npm test -- src/__tests__/components/ToolsPanel/SampleVisualization.test.tsx
```

To run tests with coverage:

```bash
npm test -- --coverage
```

## Test Structure

The tests are organized as follows:

- `__tests__/` - Root test directory
  - `App.test.tsx` - Tests for the main App component
  - `components/` - Tests for components
    - `GraphVisualization.test.tsx` - Tests for the graph visualization
    - `SchemaNodeRendering.test.tsx` - Tests for schema node rendering
    - `ToolsPanel/` - Tests for tools panel components
      - `ToolsPanel.test.tsx` - Tests for the main tools panel
      - `SampleVisualization.test.tsx` - Tests for sample visualization
  - `schema/` - Tests for schema-related functionality
    - `SchemaVisualization.test.tsx` - Tests for schema visualization
  - `setupTests.ts` - Test setup file with mocks for browser APIs

## Writing Tests

When writing tests, follow these guidelines:

1. Use React Testing Library to test components
2. Mock external dependencies (Neo4j Service, ForceGraph, etc.)
3. Test both UI rendering and component functionality
4. For complex components, test individual functions separately
5. Use `jest.mock()` to mock child components for isolated testing

## Mocking

Common mocks are set up in the `setupTests.ts` file, including:

- ResizeObserver
- requestAnimationFrame
- fetch API

Component-specific mocks are set up in individual test files. 