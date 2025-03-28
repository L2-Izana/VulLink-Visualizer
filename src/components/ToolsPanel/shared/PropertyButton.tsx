import React, { useState } from 'react';

interface PropertyButtonProps {
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
  /** Optional callback to clear all selections */
  onDiscardAll?: () => void;
  /** Optional label to display above the property buttons */
  label?: string;
  /** Whether the property buttons are disabled */
  disabled?: boolean;
}

/**
 * PropertyButton Component
 *
 * A reusable component for displaying a list of property buttons with optional "Select All" and "Discard All" buttons.
 * Properties are rendered as interactive spans that visually indicate selection state.
 *
 * @param props - The properties for the component.
 */
const PropertyButton: React.FC<PropertyButtonProps> = ({
  options,
  selectedOptions,
  onChange,
  onSelectAll,
  onDiscardAll,
  label,
  disabled = false,
}) => {
  // State to track which button is being hovered and the select/discard all button hover states
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [isSelectAllHovered, setIsSelectAllHovered] = useState(false);
  const [isDiscardAllHovered, setIsDiscardAllHovered] = useState(false);

  return (
    <div style={styles.container}>
      {label && <h4 style={styles.label}>{label}</h4>}
      <div style={styles.actionButtons}>
        {onSelectAll && (
          <button 
            onClick={onSelectAll} 
            onMouseEnter={() => !disabled && setIsSelectAllHovered(true)}
            onMouseLeave={() => !disabled && setIsSelectAllHovered(false)}
            style={{
              ...styles.selectAllButton,
              ...(isSelectAllHovered && !disabled ? styles.selectAllButtonHovered : {}),
              ...(disabled ? styles.disabledButton : {})
            }}
            disabled={disabled}
          >
            Select All
          </button>
        )}
        {onDiscardAll && (
          <button 
            onClick={onDiscardAll} 
            onMouseEnter={() => !disabled && setIsDiscardAllHovered(true)}
            onMouseLeave={() => !disabled && setIsDiscardAllHovered(false)}
            style={{
              ...styles.discardAllButton,
              ...(isDiscardAllHovered && !disabled ? styles.discardAllButtonHovered : {}),
              ...(disabled ? styles.disabledButton : {})
            }}
            disabled={disabled || selectedOptions.length === 0}
          >
            Discard All
          </button>
        )}
      </div>
      <div style={styles.buttonGroup}>
        {options.map((option) => {
          const isSelected = selectedOptions.includes(option);
          const isHovered = hoveredButton === option;
          
          return (
            <span
              key={option}
              onClick={() => !disabled && onChange(option, !isSelected)}
              onMouseEnter={() => !disabled && setHoveredButton(option)}
              onMouseLeave={() => !disabled && setHoveredButton(null)}
              style={{
                ...styles.propertyButton,
                ...(isSelected ? styles.selectedButton : {}),
                ...(isHovered && !isSelected ? styles.hoveredButton : {}),
                ...(isHovered && isSelected ? styles.hoveredSelectedButton : {}),
                ...(disabled ? styles.disabledButton : {})
              }}
            >
              {option}
            </span>
          );
        })}
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
  actionButtons: {
    display: 'flex',
    gap: '10px',
    marginBottom: '10px',
  },
  selectAllButton: {
    padding: '6px 16px',
    backgroundColor: '#5d4a7e',
    color: 'white',
    border: 'none',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    transition: 'all 0.2s ease',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  selectAllButtonHovered: {
    backgroundColor: '#47366a',
    boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
    transform: 'translateY(-1px)',
  },
  discardAllButton: {
    padding: '6px 16px',
    backgroundColor: '#e05c5c',
    color: 'white',
    border: 'none',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    transition: 'all 0.2s ease',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  discardAllButtonHovered: {
    backgroundColor: '#c74545',
    boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
    transform: 'translateY(-1px)',
  },
  buttonGroup: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    margin: '5px 0',
  },
  propertyButton: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '6px 12px',
    backgroundColor: '#f5f7fa',
    color: '#555',
    border: '1px solid #ddd',
    borderRadius: '20px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '14px',
    fontWeight: 500,
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    userSelect: 'none',
  },
  hoveredButton: {
    backgroundColor: '#edf0f5',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    transform: 'translateY(-1px)',
  },
  selectedButton: {
    backgroundColor: '#4a90e2',
    color: 'white',
    border: '1px solid #3a80d2',
  },
  hoveredSelectedButton: {
    backgroundColor: '#3a80d2',
    boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
    transform: 'translateY(-1px)',
  },
  disabledButton: {
    backgroundColor: '#eaecef',
    color: '#999',
    cursor: 'not-allowed',
    opacity: 0.7,
    boxShadow: 'none',
  },
} as const;

export default PropertyButton; 