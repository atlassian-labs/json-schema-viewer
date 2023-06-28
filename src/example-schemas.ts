type ExampleSchemaSection = Record<string, string>
export const exampleSchemas: Record<string, ExampleSchemaSection> = {
  "Atlassian schema examples": {
    "Atlassian Forge": "https://unpkg.com/@forge/manifest@latest/out/schema/manifest-schema.json",
    "Atlassian Connect - Confluence": "https://bitbucket.org/atlassian/connect-schemas/raw/master/confluence-global-schema-strict.json",
    "Atlassian Connect - Jira": "https://bitbucket.org/atlassian/connect-schemas/raw/master/jira-global-schema-strict.json"
  },
  "Schema examples": {
    "OpenAPI (v3)": "https://raw.githubusercontent.com/OAI/OpenAPI-Specification/3.0.3/schemas/v3.0/schema.json",
    "Swagger (v2)": "https://json.schemastore.org/swagger-2.0",
    "NPM (package.json)": "https://json.schemastore.org/package"
  },
  "JSON Schema Meta Schemas": {
    "Draft-07": "https://json-schema.org/draft-07/schema",
    "Draft-04": "https://json-schema.org/draft-04/schema"
  }
}
