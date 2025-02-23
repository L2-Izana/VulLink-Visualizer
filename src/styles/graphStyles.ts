export const graphContainerStyle = {
  height: '500px',
  border: '1px solid #ccc',
  margin: '10px',
  borderRadius: '8px',
  backgroundColor: '#fff',
  position: 'relative' as const,
  overflow: 'hidden'
};

export const nodeDetailsStyle = {
  position: 'absolute' as const,
  bottom: '20px',
  left: '20px',
  maxWidth: '280px',
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  borderRadius: '12px',
  padding: '16px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  backdropFilter: 'blur(5px)',
  border: '1px solid rgba(200, 200, 200, 0.8)',
  zIndex: 10,
  transition: 'all 0.3s ease'
};