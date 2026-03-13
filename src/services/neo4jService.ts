import neo4j, { Driver, Session } from 'neo4j-driver';
import { GraphData, NodeData, LinkData } from '../types/graph';

export class Neo4jService {
  private driver: Driver;

  constructor(url: string, user: string, password: string) {
    if (!url) throw new Error("Neo4j URL is required");
    if (!user) throw new Error("Neo4j user is required");
    if (!password) throw new Error("Neo4j password is required");
    if (user !== "neo4j") throw new Error(`Neo4j user must be "neo4j", got "${user}"`);

    this.driver = neo4j.driver(url, neo4j.auth.basic(user, password));

    // Run a quick connection check
    this.testConnection();
  }

  private async testConnection() {
    const session = this.driver.session();
    try {
      const result = await session.run(
        "MATCH (n)-[r]->(m) RETURN n, r, m LIMIT 50"
      );

      console.log(
        `Neo4j connection successful. Retrieved ${result.records.length} records.`
      );
    } catch (err) {
      console.error("Neo4j connection test failed:", err);
    } finally {
      await session.close();
    }
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

  async executeRawQuery(query: string): Promise<any[]> {
    const session = this.driver.session();

    try {
      const result = await session.run(query);

      return result.records.map(record => {
        const obj: any = {};

        record.keys.forEach(key => {
          const value = record.get(key);

          if (value === null) {
            obj[key] = null;
          } else if (value.properties) {
            obj[key] = value.properties;
          } else if (typeof value === "object" && value.low !== undefined) {
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
        properties: value.properties
      });
    }
  }

  private processRelationship(value: any, links: LinkData[]) {
    links.push({
      source: value.start.toString(),
      target: value.end.toString(),
      type: value.type
    });
  }
}