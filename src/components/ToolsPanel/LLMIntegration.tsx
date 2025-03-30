import React, { useState, useRef, useEffect } from 'react';
import { Download } from 'lucide-react';
import { convertToCSV, downloadFile } from '../../utils/download';
import PanelContainer from './shared/PanelContainer';

interface LLMIntegrationProps {
  onQuerySelect: (query: string, purpose?: 'visualization' | 'download' | 'llm') => Promise<any>;
}

interface LLMIntegrationModel {
  name: string;
  description: string;
  modelType: string;
  model: string;
}

const LLMIntegrationModels: LLMIntegrationModel[] = [
  {
    name: "all-mpnet-base-v2",
    description: "Transformer-based sentence embedding model providing high-quality semantic embeddings (768 dimensions), ideal for accurate cybersecurity risk assessment.",
    modelType: "Transformer Sentence Embedding",
    model: "mpnet"
  },
  {
    name: "SecBERT",
    description: "Cybersecurity-specific fine-tuned BERT model, optimized for vulnerability and threat classification tasks.",
    modelType: "Domain-specific Transformer",
    model: "secbert"
  },  
  {
    name: "facebook/fasttext-en-vectors",
    description: "FastText embeddings, lightweight and efficient, suitable for quick classification tasks under extreme resource constraints.",
    modelType: "Classical Embedding",
    model: "fasttext"
  },
];

interface ModelItemProps {
  model: LLMIntegrationModel;
  onSelect: (model: LLMIntegrationModel) => void;
  isSelected: boolean;
}

const ModelItem: React.FC<ModelItemProps> = ({ model, onSelect, isSelected }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  
  return (
    <div 
      style={{
        ...styles.modelItem,
        backgroundColor: isSelected 
          ? '#e1efff' 
          : isClicking 
            ? '#d8edff' 
            : isHovered 
              ? '#ebf5ff' 
              : '#f5f8fb',
        transform: isClicking 
          ? 'scale(0.98)' 
          : isHovered 
            ? 'translateY(-2px)' 
            : 'none',
        boxShadow: isSelected
          ? '0 0 0 2px #3c93ff'
          : isHovered && !isClicking 
            ? '0 4px 8px rgba(0,0,0,0.1)' 
            : '0 1px 3px rgba(0,0,0,0.05)',
        borderColor: isSelected ? '#7ab6ff' : '#eaeff4'
      }}
      onClick={() => onSelect(model)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsClicking(false);
      }}
      onMouseDown={() => setIsClicking(true)}
      onMouseUp={() => setIsClicking(false)}
    >
      <div style={styles.modelName}>{model.name}</div>
      <div style={styles.modelType}>{model.modelType}</div>
      <div style={styles.modelDescription}>{model.description}</div>
      {isSelected && (
        <div style={styles.selectedIndicator}>
          Selected
        </div>
      )}
    </div>
  );
};

/**
 * LLMIntegration Component
 * 
 * Provides a UI for downloading pre-embedded vulnerability descriptions
 * using a selected embedding model. This component allows users to first select
 * a model, then specify the year of vulnerabilities, embedding dimension, and download format.
 */
const LLMIntegration: React.FC<LLMIntegrationProps> = ({ onQuerySelect }) => {
  const [selectedModelIndex, setSelectedModelIndex] = useState<number | null>(null);
  const [year, setYear] = useState<string>('1999');
  const [embeddingDim, setEmbeddingDim] = useState<string>('32');
  const [fileFormat, setFileFormat] = useState<string>('csv');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);
  
  // Generate list of years from 1999 to current year
  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  for (let y = 1999; y <= currentYear; y++) {
    years.push(y);
  }

  const handleModelSelect = (model: LLMIntegrationModel, index: number) => {
    setSelectedModelIndex(index);
    // Scroll to form after a small delay to allow for state update
    setTimeout(() => {
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };
  
  const handleChangeModel = () => {
    setSelectedModelIndex(null);
  };

  /**
   * Handles the download of pre-embedded vulnerability descriptions
   */
  const handleDownload = async () => {
    if (selectedModelIndex === null) {
      setError("Please select a model first");
      setTimeout(() => setError(null), 3000); // Clear error after 3 seconds
      return;
    }
    
    setLoading(true);
    setError(null);
    
    const selectedModel = LLMIntegrationModels[selectedModelIndex];
    
    // Build query string with the required parameters
    const query = `model=${selectedModel.model}&year=${year}&dim_size=${embeddingDim}`;
    
    try {
      if (parseInt(embeddingDim) > 128) {
        setError("Embedding dimension must be less than 128. Please contact us to request a larger dimension.");
        setTimeout(() => setError(null), 3000); // Clear error after 3 seconds
        setLoading(false);
        return;
      }
      const result = await onQuerySelect(query, 'llm');

      if (!result){
        throw new Error("Result is null");
      }
      else if (!result.llmData){
        throw new Error("LLM data is null");
      }
      else {
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
              embeddings: Array.isArray(item.embedding) 
                ? `[${item.embedding.join(',')}]`
                : typeof item.embedding === 'string' 
                  ? item.embedding 
                  : JSON.stringify(item.embedding) // Handle other cases
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
                model: selectedModel.model,
                count: count,
                dimension: embeddingDim
              }
            };
            break;
            
          default:
            throw new Error(`Unsupported file format: ${fileFormat}`);
        }
        
        downloadFile(
          downloadData, 
          `vulnerability_embeddings_${selectedModel.model}_${year}_dim${embeddingDim}.${fileFormat}`
        );
      }
    } catch (error) {
      console.error('Download failed:', error);
      setError(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setTimeout(() => setError(null), 3000); // Clear error after 3 seconds
    } finally {
      setLoading(false);
    }
  };

  return (
    <PanelContainer
      title="LLM Vulnerability Embeddings"
      description="Download meaningfully embedded vulnerability descriptions using advanced LLM models with flexible options for cybersecurity research and applications."
    >
      <div style={styles.content}>
        {selectedModelIndex === null ? (
          <div style={styles.modelsContainer}>
            <h4 style={styles.sectionTitle}>Select Embedding Model</h4>
            
            {LLMIntegrationModels.map((model, index) => (
              <ModelItem 
                key={index} 
                model={model} 
                onSelect={(model) => handleModelSelect(model, index)}
                isSelected={selectedModelIndex === index}
              />
            ))}
          </div>
        ) : (
          <div style={styles.selectedModelContainer}>
            <div style={styles.selectedModelHeader}>
              <h4 style={styles.sectionTitle}>Selected Model</h4>
              <button 
                onClick={handleChangeModel}
                style={styles.changeModelButton}
              >
                Change Model
              </button>
            </div>
            
            <div style={styles.selectedModelContent}>
              <div style={styles.modelName}>{LLMIntegrationModels[selectedModelIndex].name}</div>
              <div style={styles.modelType}>{LLMIntegrationModels[selectedModelIndex].modelType}</div>
              <div style={styles.modelDescription}>{LLMIntegrationModels[selectedModelIndex].description}</div>
            </div>
            
            <div ref={formRef} style={styles.formContainer}>
              <h4 style={styles.formTitle}>Configure Download Parameters</h4>
              
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
              
                <div style={styles.formGroup}>
                  <label style={styles.label}>Embedding Dimension</label>
                  <input
                    className="llm-input"
                    style={styles.input}
                    value={embeddingDim}
                    onChange={(e) => setEmbeddingDim(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
              
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

              {error && (
                <div style={styles.errorMessage} role="alert">
                  {error}
                </div>
              )}
              
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
          </div>
        )}
        
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
        `}</style>
      </div>
    </PanelContainer>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  content: {
    padding: '15px',
    minHeight: '300px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    width: '100%',
    maxWidth: '100%',
    boxSizing: 'border-box',
    gap: '20px'
  },
  modelsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  selectedModelContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  selectedModelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '5px'
  },
  selectedModelContent: {
    padding: '16px',
    borderRadius: '6px',
    backgroundColor: '#e1efff',
    border: '1px solid #7ab6ff',
    boxShadow: '0 0 0 2px #3c93ff',
    position: 'relative',
  },
  changeModelButton: {
    backgroundColor: '#4b7bec',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '6px 12px',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    fontWeight: 'bold',
  },
  changeModelButtonHover: {
    backgroundColor: '#3867d6'
  },
  sectionTitle: {
    margin: '0 0 6px 0',
    fontSize: '16px',
    color: '#333',
  },
  formTitle: {
    margin: '0 0 15px 0',
    fontSize: '16px',
    color: '#333',
    borderBottom: '1px solid #eaeff4',
    paddingBottom: '8px'
  },
  modelItem: {
    padding: '12px',
    borderRadius: '6px',
    backgroundColor: '#f5f8fb',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: '1px solid #eaeff4',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    position: 'relative',
  },
  modelName: {
    fontWeight: 'bold',
    fontSize: '15px',
    marginBottom: '6px',
    color: '#2c3e50',
  },
  modelType: {
    fontSize: '12px',
    color: '#4299e1',
    marginBottom: '8px',
    fontWeight: 'bold'
  },
  modelDescription: {
    fontSize: '13px',
    color: '#7f8c8d',
    lineHeight: '1.4'
  },
  selectedIndicator: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    fontSize: '11px',
    fontWeight: 'bold',
    color: 'white',
    backgroundColor: '#4299e1',
    padding: '2px 6px',
    borderRadius: '10px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    marginTop: '5px'
  },
  formRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    marginBottom: '14px',
    width: '100%',
    maxWidth: '100%',
    boxSizing: 'border-box'
  },
  formGroup: {
    flex: '1',
    minWidth: '180px',
    maxWidth: '100%',
    boxSizing: 'border-box'
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
