import neo4j, { Driver, Session } from 'neo4j-driver';
import { GraphData, NodeData, LinkData } from '../types/graph';

export class Neo4jService {
  private driver: Driver;

  constructor(url: string, user: string, password: string) {
    this.driver = neo4j.driver(url, neo4j.auth.basic(user, password));
  }

  async executeQuery(query: string): Promise<GraphData> {
    const session: Session = this.driver.session();
    const nodesMap = new Map<string, NodeData>();
    const links: LinkData[] = [];
    try {
      const result = await session.run(query);
      result.records.forEach(record => {
        record.forEach(value => {
          if (value.identity && value.labels) {
            this.processNode(value, nodesMap);
          }
          if (value.start && value.end) {
            this.processRelationship(value, links);
          }
        });
      });

      return { 
        nodes: Array.from(nodesMap.values()), 
        links 
      };
    } finally {
      await session.close();
    }
  }

  /**
   * Executes a Cypher query and returns raw data without graph processing
   * @param query - The Cypher query to execute
   */
  async executeRawQuery(query: string): Promise<any[]> {
    const session = this.driver.session();
    try {
      const result = await session.run(query);
      return result.records.map(record => {
        const obj: any = {};
        record.keys.forEach(key => {
          const value = record.get(key);
          // Handle null values and different types of neo4j values
          if (value === null) {
            obj[key] = null;
          } else if (value.properties) {
            obj[key] = value.properties;
          } else if (typeof value === 'object' && value.low !== undefined) {
            // Handle Neo4j Integer type
            obj[key] = value.toNumber();
          } else {
            obj[key] = value;
          }
        });
        return obj;
      });
    } finally {
      await session.close();
    }
  }

  private processNode(value: any, nodesMap: Map<string, NodeData>) {
    const nodeId = value.identity.toString();
    if (!nodesMap.has(nodeId)) {
      nodesMap.set(nodeId, {
        id: nodeId,
        label: value.labels[0],
        properties: value.properties,
      });
    }
  }

  private processRelationship(value: any, links: LinkData[]) {
    links.push({
      source: value.start.toString(),
      target: value.end.toString(),
      type: value.type,
    });
  }
}