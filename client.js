const { BigQueryWriteClient } = require('@google-cloud/bigquery-storage').v1;
const st = require('./sample_data_pb.js');
const type = require('@google-cloud/bigquery-storage').protos.google.protobuf
  .FieldDescriptorProto.Type;
const mode = require('@google-cloud/bigquery-storage').protos.google.cloud
  .bigquery.storage.v1.WriteStream.Type;

const storageClient = new BigQueryWriteClient();

const project = 'node-bq-storage';
const dataset = 'samples';
const parent = `projects/${project}/datasets/${dataset}/tables/sample`;
var writeStream = { type: mode.PENDING };

var sample_data = new st.SampleData();

var protoDescriptor = {};
protoDescriptor.name = 'sample_data';
protoDescriptor.field = [
  { name: 'request', number: 1, type: type.TYPE_INT64 },
  { name: 'url', number: 2, type: type.TYPE_STRING },
  { name: 'token', number: 3, type: type.TYPE_INT64 },
];

async function run() {
  try {
    var request = {
      parent,
      writeStream,
    };
    var response = await storageClient.createWriteStream(request);

    writeStream = response[0].name;

    var serializedRows = [];

    //Row 1
    sample_data.setRequest(3);
    sample_data.setUrl('https://www.azenix.com.au/');
    sample_data.setToken(422812321);

    serializedRows.push(sample_data.serializeBinary());

    //Row 2
    sample_data.setRequest(4);
    sample_data.setUrl('https://www.cuusoo.com.au/');
    sample_data.setToken(2190213891);

    serializedRows.push(sample_data.serializeBinary());

    var protoRows = {
      serializedRows,
    };
    var proto_data = {
      writerSchema: { protoDescriptor },
      rows: protoRows,
    };

    // Construct request
    request = {
      writeStream,
      protoRows: proto_data,
    };

    // Insert rows
    const stream = await storageClient
      .appendRows()
      .on('error', (err) => {
        console.log('error:', err.message);
      })
      .on('data', (response) => {
        console.log(response);
      })
      .on('end', async () => {
        /* API call completed */
        try {
          var response = await storageClient.finalizeWriteStream({
            name: writeStream,
          });

          response = await storageClient.batchCommitWriteStreams({
            parent,
            writeStreams: [writeStream],
          });
        } catch (err) {
          console.log(err);
        }
      });
    stream.write(request);
    stream.end();
  } catch (err) {
    console.log(err);
  }
}

run();
