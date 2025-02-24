import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { downloadFile } from '../../utils/download';

type ModelType = 'sbert' | 'hf' | 'llama';

interface ModelOption {
  value: string;
  label: string;
}

const modelOptions: Record<ModelType, ModelOption[]> = {
  sbert: [
    { value: 'all-MiniLM-L6-v2', label: 'Sentence Transformer: all-MiniLM-L6-v2' },
    { value: 'paraphrase-MiniLM-L6-v2', label: 'Sentence Transformer: paraphrase-MiniLM-L6-v2' },
    { value: 'all-mpnet-base-v2', label: 'Sentence Transformer: all-mpnet-base-v2' },
    { value: 'multi-qa-mpnet-base-cos-v1', label: 'Sentence Transformer: multi-qa-mpnet-base-cos-v1' }
  ],
  hf: [
    { value: 'distilbert-base-uncased', label: 'DistilBERT: distilbert-base-uncased' },
    { value: 'bert-base-uncased', label: 'BERT: bert-base-uncased' },
    { value: 'roberta-base', label: 'RoBERTa: roberta-base' },
    { value: 'xlm-roberta-base', label: 'XLM-RoBERTa: xlm-roberta-base' },
    { value: 'albert-base-v2', label: 'ALBERT: albert-base-v2' }
  ],
  llama: [
    { value: 'TheBloke/guanaco-7B', label: 'LLaMA (Public): TheBloke/guanaco-7B' }
  ]
};

interface LLMIntegrationProps {
  onQuerySelect: (query: string, purpose?: 'visualization' | 'download' | 'llm') => Promise<any>;
}

const LLMIntegration: React.FC<LLMIntegrationProps> = ({ onQuerySelect }) => {
  const [modelType, setModelType] = useState<ModelType>('sbert');
  const [modelName, setModelName] = useState<string>(modelOptions['sbert'][0].value);
  const [year, setYear] = useState<string>('2020');
  const [embeddingDim, setEmbeddingDim] = useState<string>('20');
  const [fileFormat, setFileFormat] = useState<string>('pkl');

  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  for (let y = 1999; y <= currentYear; y++) {
    years.push(y);
  }

  const handleModelTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newModelType = e.target.value as ModelType;
    setModelType(newModelType);
    setModelName(modelOptions[newModelType][0].value);
  };

  const handleDownload = async () => {
    // Build query string for the LLM backend.
    const query = `model_name=${modelName}&model_type=${modelType}&year=${year}&embedding_dim=${embeddingDim}&file_format=${fileFormat}`;
    console.log(query);
    try {
      const result = await onQuerySelect(query, 'llm');
      downloadFile(result, `llm_embeddings.${fileFormat}`);
    } catch (error) {
      console.error('LLM Embedding retrieval failed:', error);
    }
  };

  return (
    <div style={styles.outerContainer}>
      <div style={styles.card} className="card">
        <h2 style={styles.header}>LLM Representation for Vulnerability Descriptions</h2>
        {/* First Row */}
        <div style={styles.formRow}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Model Type</label>
            <select
              className="llm-input"
              style={styles.input}
              value={modelType}
              onChange={handleModelTypeChange}
            >
              <option value="sbert">Sentence Transformer (sbert)</option>
              <option value="hf">Hugging Face (hf)</option>
              <option value="llama">LLaMA (Public)</option>
            </select>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Model Name</label>
            <select
              className="llm-input"
              style={styles.input}
              value={modelName}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setModelName(e.target.value)}
            >
              {modelOptions[modelType].map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Year</label>
            <select
              className="llm-input"
              style={styles.input}
              value={year}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setYear(e.target.value)}
            >
              {years.map(yr => (
                <option key={yr} value={yr}>{yr}</option>
              ))}
            </select>
          </div>
        </div>
        {/* Second Row */}
        <div style={styles.formRow}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Embedding Dimension</label>
            <input
              className="llm-input"
              type="number"
              style={styles.input}
              value={embeddingDim}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmbeddingDim(e.target.value)}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>File Format</label>
            <select
              className="llm-input"
              style={styles.input}
              value={fileFormat}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFileFormat(e.target.value)}
            >
              <option value="pkl">PKL</option>
              <option value="csv">CSV</option>
            </select>
          </div>
        </div>
        <button className="llm-button" style={styles.button} onClick={handleDownload}>
          <Download style={styles.icon} size={20} />
          Download Embeddings
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
        .llm-button:hover {
          background-color: #005fa3 !important;
        }
        .llm-button:active {
          transform: scale(0.98);
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
    padding: '20px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    padding: '30px',
    width: '100%',
    maxWidth: '800px'
  },
  header: {
    fontSize: '1.8rem',
    marginBottom: '24px',
    textAlign: 'center',
    color: '#333'
  },
  formRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
    marginBottom: '16px'
  },
  formGroup: {
    flex: '1',
    minWidth: '200px'
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
  icon: {
    marginRight: '8px'
  }
};

export default LLMIntegration;
