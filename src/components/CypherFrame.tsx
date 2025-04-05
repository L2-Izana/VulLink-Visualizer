/**
 * @fileoverview A React component that provides a Cypher query interface.
 * Allows users to input and execute Cypher queries against Neo4j database.
 */

import React, { useState, useRef, useEffect } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';

/** Props for the CypherFrame component */
interface CypherFrameProps {
  /** Callback function to execute the query */
  runQuery: (query: string) => void;
  /** Error message to display if query fails */
  error?: string | null;
  /** Warning message to display for query limitations */
  warning?: string | null;
  /** Default query to display in the editor */
  defaultQuery?: string;
}

// Node types and relationship types from your schema
const nodeTypes = ['Vulnerability', 'Product', 'Vendor', 'Domain', 'Weakness', 'Exploit', 'Author'];
const relationshipTypes = ['AFFECTS', 'REFERS_TO', 'EXAMPLE_OF', 'EXPLOITS', 'WRITES', 'BELONGS_TO'];

/**
 * CypherFrame Component
 * Provides a textarea for Cypher query input and execution
 */
const CypherFrame: React.FC<CypherFrameProps> = ({ runQuery, error, warning, defaultQuery }) => {
  const [query, setQuery] = useState(defaultQuery || 'MATCH (n)-[r]->(m) RETURN n, r, m LIMIT 50');
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  // Update editor content when defaultQuery prop changes
  useEffect(() => {
    if (defaultQuery && editorRef.current) {
      editorRef.current.setValue(defaultQuery);
      setQuery(defaultQuery);
    }
  }, [defaultQuery]);

  const handleRunQuery = () => {
    runQuery(query);
  };

  const handleEditorDidMount: OnMount = (editor, monacoInstance) => {
    editorRef.current = editor;
    
    // If defaultQuery is provided during mount, set the editor value
    if (defaultQuery && defaultQuery !== editor.getValue()) {
      editor.setValue(defaultQuery);
    }
    
    // Register Cypher language
    monacoInstance.languages.register({ id: 'cypher' });
    
    // Define Cypher syntax highlighting
    monacoInstance.languages.setMonarchTokensProvider('cypher', {
      tokenizer: {
        root: [
          [/MATCH|WHERE|RETURN|WITH|LIMIT|ORDER BY|CREATE|DELETE|SET|MERGE/i, 'keyword'],
          [/\(|\)|\[|\]|:|{|}/, 'operator'],
          [/\d+/, 'number'],
          [/".*?"|'.*?'/, 'string'],
          [/\/\/.*$/, 'comment'],
        ]
      }
    });
    
    // Define autocompletion provider
    monacoInstance.languages.registerCompletionItemProvider('cypher', {
      triggerCharacters: [' ', ':', '(', '[', '.'],
      provideCompletionItems: (model, position) => {
        const wordInfo = model.getWordUntilPosition(position);
        const wordRange = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: wordInfo.startColumn,
          endColumn: wordInfo.endColumn
        };
        
        const line = model.getLineContent(position.lineNumber);
        const lineUntilPosition = line.substring(0, position.column - 1);
        
        const suggestions: monaco.languages.CompletionItem[] = [];
        
        // Check for node pattern with colon
        const nodePattern = /\([a-zA-Z]*:([a-zA-Z]*)$/i.exec(lineUntilPosition);
        if (nodePattern) {
          const prefix = nodePattern[1]?.toLowerCase() || '';
          const filteredNodeTypes = nodeTypes.filter(type => 
            type.toLowerCase().startsWith(prefix)
          );
          
          return {
            suggestions: filteredNodeTypes.map(type => ({
              label: type,
              kind: monacoInstance.languages.CompletionItemKind.Class,
              insertText: type,
              range: {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: position.column - prefix.length,
                endColumn: position.column
              }
            }))
          };
        }
        
        // Check for relationship pattern with colon
        const relPattern = /\[[a-zA-Z]*:([a-zA-Z]*)$/i.exec(lineUntilPosition);
        if (relPattern) {
          const prefix = relPattern[1]?.toLowerCase() || '';
          const filteredRelTypes = relationshipTypes.filter(type => 
            type.toLowerCase().startsWith(prefix)
          );
          
          return {
            suggestions: filteredRelTypes.map(type => ({
              label: type,
              kind: monacoInstance.languages.CompletionItemKind.Interface,
              insertText: type,
              range: {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: position.column - prefix.length,
                endColumn: position.column
              }
            }))
          };
        }
        
        // Keywords at the beginning of words
        const keywords = ['MATCH', 'WHERE', 'RETURN', 'WITH', 'LIMIT', 'ORDER BY', 'CREATE', 'DELETE', 'SET', 'MERGE'];
        const currentWord = wordInfo.word.toLowerCase();
        
        if (currentWord) {
          const filteredKeywords = keywords.filter(keyword => 
            keyword.toLowerCase().startsWith(currentWord)
          );
          
          suggestions.push(...filteredKeywords.map(keyword => ({
            label: keyword,
            kind: monacoInstance.languages.CompletionItemKind.Keyword,
            insertText: keyword,
            range: wordRange
          })));
        } else {
          // If no current word, suggest all keywords
          suggestions.push(...keywords.map(keyword => ({
            label: keyword,
            kind: monacoInstance.languages.CompletionItemKind.Keyword,
            insertText: keyword,
            range: wordRange
          })));
        }
        
        return { suggestions };
      }
    });
  };

  return (
    <div
      style={{
        margin: '10px',
        padding: '10px',
        border: '1px solid #ccc',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}
    >
      
      {/* Error and warning messages */}
      {error && (
        <div style={{
          padding: '5px 10px',
          marginBottom: '8px',
          backgroundColor: '#ffebee',
          border: '1px solid #ffcdd2',
          borderRadius: '4px',
          color: '#c62828',
          fontSize: '13px'
        }}>
          Error: {error}
        </div>
      )}
      {warning && (
        <div style={{
          padding: '5px 10px',
          marginBottom: '8px',
          backgroundColor: '#fff3e0',
          border: '1px solid #ffe0b2',
          borderRadius: '4px',
          color: '#e65100',
          fontSize: '13px'
        }}>
          {warning}
        </div>
      )}

      {/* Reduce height to 120px */}
      <div style={{ height: '120px', border: '1px solid #ddd', borderRadius: '4px' }}>
        <Editor
          height="120px"
          defaultLanguage="cypher"
          defaultValue={query}
          onChange={(value) => setQuery(value || '')}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            lineNumbers: 'on',
            fontSize: 18,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 5 },
            quickSuggestions: true,
            suggestOnTriggerCharacters: true
          }}
        />
      </div>
      
      {/* Make the button more visible */}
      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        <button
          onClick={handleRunQuery}
          style={{
            padding: '8px 20px',
            backgroundColor: '#4B0082',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease',
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#6A0DAD')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#4B0082')}
        >
          Run Query
        </button>
      </div>
    </div>
  );
};

export default CypherFrame;
