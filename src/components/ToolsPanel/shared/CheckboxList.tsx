import React from 'react';

interface CheckboxListProps {
  /** List of options to display */
  options: string[];
  /** Options that are currently selected */
  selectedOptions: string[];
  /**
   * Callback triggered when an option is toggled.
   * @param option - The option being toggled.
   * @param checked - The new checked state.
   */
  onChange: (option: string, checked: boolean) => void;
  /** Optional callback to select all options */
  onSelectAll?: () => void;
  /** Optional label to display above the checkbox list */
  label?: string;
  /** Whether the checkbox list is disabled */
  disabled?: boolean;
}

/**
 * CheckboxList Component
 *
 * A reusable component for displaying a list of checkboxes with an optional "Select All" button.
 *
 * @param props - The properties for the component.
 */
const CheckboxList: React.FC<CheckboxListProps> = ({
  options,
  selectedOptions,
  onChange,
  onSelectAll,
  label,
  disabled = false,
}) => {
  return (
    <div style={styles.container}>
      {label && <h4 style={styles.label}>{label}</h4>}
      {onSelectAll && (
        <button 
          onClick={onSelectAll} 
          style={{
            ...styles.selectAllButton,
            ...(disabled ? styles.disabledButton : {})
          }}
          disabled={disabled}
        >
          Select All
        </button>
      )}
      <div style={styles.checkboxGroup}>
        {options.map((option) => (
          <label key={option} style={{
            ...styles.checkboxLabel,
            ...(disabled ? styles.disabledLabel : {})
          }}>
            <input
              type="checkbox"
              checked={selectedOptions.includes(option)}
              onChange={(e) => onChange(option, e.target.checked)}
              disabled={disabled}
            />
            {option}
          </label>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    marginBottom: '20px',
  },
  label: {
    marginBottom: '10px',
  },
  selectAllButton: {
    padding: '6px 12px',
    marginBottom: '10px',
    backgroundColor: '#4a90e2',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
    cursor: 'not-allowed',
    opacity: 0.7
  },
  checkboxGroup: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '10px',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  disabledLabel: {
    opacity: 0.7,
    cursor: 'not-allowed'
  }
} as const;

export default CheckboxList;
