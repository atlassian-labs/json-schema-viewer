# Using JSON Schema Viewer

In order to use the JSON Schema Viewer you must have:

 * **A valid JSON Schema that supports Draft-07 of the JSON Schema format**  
   Earlier versions of JSON Schema are probably supported, however they are, as of yet, not fully tested. Later 
   JSON Schema versions are also not tested.
 * **The JSON Schema must be available on public the internet**  
   Or, at the very least, available via a HTTP GET request to all of the people that you want to be able to use
   JSON Schema Viewer to see your schema. For example, if you made a JSON Schema available to be downloaded only
   by people on your companies internal network, they should still be able to use this tool to view that JSON Schema.
 * **The JSON Schema must not have any external references**  
   If you have a JSON Schema that you provide to this app, you must make sure that it has no external references.
   [External references are not supported][4]. If you want to generate a fully resolved JSON Schema then please use a
   tool like [![npm][2]][3].

Once you have loaded your JSON Schema into the JSON Schema Viewer App (a purely client side experience with no Server backend)
you will then be provided in the UI with a "Permalink" that you can use to share direct links to specific parts of your schema
with other people.

And that's all that there is to it! If you want to contribute fixes back to the project, or raise issues, the
[source code for this project is in GitHub][1].

 [1]: https://github.com/atlassian-labs/json-schema-viewer
 [2]: https://img.shields.io/npm/v/@apidevtools/json-schema-ref-parser?label=@apidevtools/json-schema-ref-parser&logo=npm
 [3]: https://www.npmjs.com/package/@apidevtools/json-schema-ref-parser
 [4]: https://github.com/atlassian-labs/json-schema-viewer/issues/7
