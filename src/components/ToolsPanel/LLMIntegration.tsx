import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { convertToCSV, downloadFile } from '../../utils/download';

interface LLMIntegrationProps {
  onQuerySelect: (query: string, purpose?: 'visualization' | 'download' | 'llm') => Promise<any>;
}

/**
 * LLMIntegration Component
 * 
 * Provides a UI for downloading pre-embedded vulnerability descriptions
 * using a single embedding model. This component allows users to select
 * the year of vulnerabilities, embedding dimension, and download format.
 */
const LLMIntegration: React.FC<LLMIntegrationProps> = ({ onQuerySelect }) => {
  const [year, setYear] = useState<string>('1999');
  const [embeddingDim, setEmbeddingDim] = useState<string>('20');
  const [fileFormat, setFileFormat] = useState<string>('csv');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Generate list of years from 1999 to current year
  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  for (let y = 1999; y <= currentYear; y++) {
    years.push(y);
  }

  /**
   * Handles the download of pre-embedded vulnerability descriptions
   */
  const handleDownload = async () => {
    setLoading(true);
    setError(null);
    
    // Build query string with the required parameters: year and dim_size (file_format will be handled in the frontend)
    const query = `year=${year}&dim_size=${embeddingDim}`;
    
    try {
      const result = await onQuerySelect(query, 'llm');

      if (!result){
        throw new Error("Result is null");
      }
      else if (!result.llmData){
        throw new Error("LLM data is null");
      }
      else{
      const { embeddings, cveIDs, count } = result.llmData;
      // Combine embeddings with cveIDs into an array of objects
      const combinedData = embeddings.map((embedding: number[], index: number) => ({
        cveID: cveIDs[index],
        embedding: embedding
      }));
      let downloadData;
      switch (fileFormat) {
        case 'csv':
          // For CSV, keep embeddings as a single column with array format
          const flattenedData = combinedData.map((item: any) => ({
            cveID: item.cveID,
            embeddings: `[${item.embedding.join(',')}]` // Convert array to string representation
          }));
          downloadData = convertToCSV(flattenedData);
          break;
          
        case 'json':
          // For JSON, keep the original structure but rename 'embedding' to 'embeddings'
          downloadData = combinedData.map((item: any) => ({
            cveID: item.cveID,
            embeddings: item.embedding // Just rename the field
          }));
          break;
          
        case 'pkl':
          // For pickle format, maintain the same two-column structure
          downloadData = {
            data: combinedData.map((item: any) => ({
              cveID: item.cveID,
              embeddings: item.embedding
            })),
            metadata: {
              count: count,
              dimension: embeddingDim
            }
          };
          break;
          
        default:
          throw new Error(`Unsupported file format: ${fileFormat}`);
      }
      console.log(downloadData);
      downloadFile(
        downloadData, 
        `vulnerability_embeddings_${year}_dim${embeddingDim}.${fileFormat}`
        );
        console.log("Downloaded");
      }
    } catch (error) {
      console.error('Download failed:', error);
      setError(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.outerContainer}>
      <div style={styles.card} className="card">
        <h2 style={styles.header}>LLM-Based Vulnerability Description Embeddings</h2>
        <p style={styles.description}>
          Download pre-embedded vulnerability descriptions using our unified embedding model.
          These embeddings can be used for exploitability prediction, coexploitation behavior discovery, and other NLP tasks.
        </p>
        
        {/* Year Selection */}
        <div style={styles.formRow}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Year</label>
            <select
              className="llm-input"
              style={styles.input}
              value={year}
              onChange={(e) => setYear(e.target.value)}
              disabled={loading}
            >
              {years.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>
        
          {/* Embedding Dimension */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Embedding Dimension</label>
            <input
              className="llm-input"
              type="number"
              style={styles.input}
              value={embeddingDim}
              onChange={(e) => setEmbeddingDim(e.target.value)}
              min="10"
              max="100"
              disabled={loading}
            />
          </div>
        </div>
        
        {/* File Format */}
        <div style={styles.formRow}>
          <div style={styles.formGroup}>
            <label style={styles.label}>File Format</label>
            <select
              className="llm-input"
              style={styles.input}
              value={fileFormat}
              onChange={(e) => setFileFormat(e.target.value)}
              disabled={loading}
            >
              <option value="csv">CSV</option>
              <option value="pkl">PKL</option>
              <option value="json">JSON</option>
            </select>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div style={styles.errorMessage} role="alert">
            {error}
          </div>
        )}
        
        {/* Download button */}
        <button
          className="llm-button"
          style={{
            ...styles.button,
            ...(loading ? styles.disabledButton : {})
          }}
          onClick={handleDownload}
          disabled={loading}
        >
          {loading ? (
            "Loading..."
          ) : (
            <>
              <Download style={styles.icon} size={20} />
              Download Embeddings
            </>
          )}
        </button>
      </div>
      <style>{`
        .llm-input {
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .llm-input:focus {
          border-color: #007ACC !important;
          box-shadow: 0 0 5px rgba(0, 122, 204, 0.5);
          outline: none;
        }
        .llm-button {
          transition: background-color 0.2s ease, transform 0.1s ease;
        }
        .llm-button:hover:not(:disabled) {
          background-color: #005fa3 !important;
        }
        .llm-button:active:not(:disabled) {
          transform: scale(0.98);
        }
        .card {
          transition: box-shadow 0.3s ease;
        }
        .card:hover {
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
        }
      `}</style>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  outerContainer: {
    padding: '10px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    padding: '20px',
    width: '100%',
  },
  header: {
    fontSize: '1.5rem',
    marginBottom: '12px',
    textAlign: 'center',
    color: '#333'
  },
  description: {
    textAlign: 'left',
    color: '#666',
    marginBottom: '20px',
    lineHeight: '1.5',
    fontSize: '0.9rem'
  },
  formRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    marginBottom: '14px'
  },
  formGroup: {
    flex: '1',
    minWidth: '180px'
  },
  label: {
    display: 'block',
    marginBottom: '4px',
    fontWeight: 'bold',
    color: '#555'
  },
  input: {
    width: '100%',
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ccc'
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#007ACC',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '16px'
  },
  disabledButton: {
    backgroundColor: '#cccccc',
    cursor: 'not-allowed',
    opacity: 0.7
  },
  icon: {
    marginRight: '8px'
  },
  errorMessage: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '10px',
    borderRadius: '4px',
    marginBottom: '15px',
    fontSize: '14px'
  }
};

export default LLMIntegration;
