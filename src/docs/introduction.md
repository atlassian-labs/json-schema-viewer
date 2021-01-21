# Introduction

Welcome to the JSON Schema Viewer, the best way to view JSON Schema! 

## History

Atlassian originally wrote a REST API documentation viewer for developer.atlassian.com,
as part of this REST API documentation viewer there was a requirement to show request
and response payloads in an easily understandible manner. 

The developer.atlassian.com team identified that we needed an easier and more reliable
way to view the request and response payloads and built a Schema Explorer to handle that 
use case. You can see that schema explorer if you view the REST API documentation in 
developer.atlassian.com and view request and response objects:

 * [JIRA REST API](https://developer.atlassian.com/cloud/jira/platform/rest/)
 * [Confluence REST API](https://developer.atlassian.com/cloud/confluence/rest/)

Due to the similarities between the Schema object in Swagger / OpenAPI and the JSON Schema
format, we realised that we could probably open source the Schema Explorer and make it 
available to everybody. It would act as a reusable component that everybody could enjoy.

Robert Massaioli took this realisation and created JSON Schema Viewer to externalise this
JSON Schema Viewer. Atlassian agreed, as part of its [open source program][3], that this would 
be an excellent project to Open Source and [so it was][4] as part of the Labs project.

I hope that you get great usage from the JSON Schema Viewer and that it helps you consume or 
share JSON Schemas.

## Original Authors

The developer that release JSON Schema Viewer to the world was [Robert Massaioli][2], however
the code that made up JSON Schema Viewer was developed by the [developer.atlassian.com][1] team
at Atlassian.

 [1]: https://developer.atlassian.com
 [2]: https://keybase.io/robertmassaioli
 [3]: https://developer.atlassian.com/platform/open-source/
 [4]: https://github.com/atlassian-labs/json-schema-viewer