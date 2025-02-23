export const NEO4J_CONFIG = {
  url: process.env.REACT_APP_NEO4J_URL || 'bolt://localhost:7687',
  user: process.env.REACT_APP_NEO4J_USER || 'neo4j',
  password: process.env.REACT_APP_NEO4J_PASSWORD || 'default'
};