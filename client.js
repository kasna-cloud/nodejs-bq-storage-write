const { BigQueryWriteClient } = require('@google-cloud/bigquery-storage').v1;
const st = require('./sample_data_pb.js');
const type = require('@google-cloud/bigquery-storage').protos.google.protobuf
  .FieldDescriptorProto.Type;
const mode = require('@google-cloud/bigquery-storage').protos.google.cloud
  .bigquery.storage.v1.WriteStream.Type;

const storageClient = new BigQueryWriteClient();
const project = 'node-bq-storage';
const dataset = 'test';
const parent = `projects/${project}/datasets/${dataset}/tables/SampleData`;
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
    sample_data.setRequest(1);
    sample_data.setUrl('https://kasna.com.au/');
    sample_data.setToken(122800695);

    serializedRows.push(sample_data.serializeBinary());

    //Row 2
    sample_data.setRequest(2);
    sample_data.setUrl('https://www.cmdsolutions.com.au/');
    sample_data.setToken(514027697);

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
    const stream = await storageClient.appendRows();

    stream.on('data', (response) => {
      console.log(response);
    });
    stream.on('error', (err) => {
      throw err;
    });
    stream.on('end', async () => {
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
