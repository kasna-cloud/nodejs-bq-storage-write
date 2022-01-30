# NodeJS Client for BigQuery Storage API

# How to start

Write Data

```
npm run write
```

Read Existing Data

```
npm run read
```

# Example 1

https://stackoverflow.com/questions/69793756/write-rows-to-bigquery-via-nodejs-bigquery-storage-write-api

# Example 2

With a static-ish schema, the "raw" API should be feasible.

You'll need to create a proto2 schema and compile it to Node.js, similar to what is done in the Python sample(s): https://github.com/googleapis/python-bigquery-storage/blob/main/samples/snippets/sample_data.proto Be mindful of the restrictions documented here: https://cloud.google.com/bigquery/docs/write-api#use_the_grpc_api_directly importantly, "The protocol buffer message cannot use a package specifier, and all nested or enumeration types must be defined within the top-level root message. References to external messages are not allowed"

Using the Node.js client should be similar to how we use it in Python https://github.com/googleapis/python-bigquery-storage/blob/main/samples/snippets/append_rows_proto2.py

0. Create a BigQueryWriteClient https://cloud.google.com/nodejs/docs/reference/bigquery-storage/latest/bigquery-storage/v1.bigquerywriteclient
1. Create a stream (or use the "default" stream for a table) https://cloud.google.com/nodejs/docs/reference/bigquery-storage/latest/bigquery-storage/v1.bigquerywriteclient#_google_cloud_bigquery_storage_v1_BigQueryWriteClient_createWriteStream_member_1_
2. Call appendRows to connect to the stream https://cloud.google.com/nodejs/docs/reference/bigquery-storage/latest/bigquery-storage/v1.bigquerywriteclient#_google_cloud_bigquery_storage_v1_BigQueryWriteClient_appendRows_member_1_
3. Write batches of rows to the Node.js stream object returned by appendRows
4. If PENDING mode, finalized the stream https://cloud.google.com/nodejs/docs/reference/bigquery-storage/latest/bigquery-storage/v1.bigquerywriteclient#_google_cloud_bigquery_storage_v1_BigQueryWriteClient_finalizeWriteStream_member_1_
5. Commit the stream https://cloud.google.com/nodejs/docs/reference/bigquery-storage/latest/bigquery-storage/v1.bigquerywriteclient#_google_cloud_bigquery_storage_v1_BigQueryWriteClient_batchCommitWriteStreams_member_1_
