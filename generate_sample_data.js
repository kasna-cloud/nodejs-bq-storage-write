const faker = require('faker');
const yaml = require('js-yaml');
const fs = require('fs');
const { BigQuery } = require('@google-cloud/bigquery');
const bigquery = new BigQuery();

const yamlSource = './data/realtime_transaction_layer_table.yaml';
const datasetId = 'samples_au';
const tableId = 'traffic_guard';

function createFakeData() {
  // Get document, or throw exception on error
  try {
    let schemas = {};
    const doc = yaml.load(fs.readFileSync(yamlSource, 'utf8'));
    doc?.resources[0]?.properties?.schema.forEach((schema, index) => {
      // console.log(`name ${schema.name}  type ${schema.type}`);
      if (schema.type === 'TIMESTAMP') {
        schemas[schema.name] = parseInt(
          (
            faker.date.between('2020-12-01', '2022-11-05').getTime() / 1000
          ).toFixed(0)
        );
        console.log(
          'test our data',
          parseInt((faker.datatype.datetime().getTime() / 1000).toFixed(0))
        );
      } else if (schema.type === 'STRING') {
        console.log('nothing');
        schemas[schema.name] = faker.datatype.string();
      } else if (schema.type === 'FLOAT64') {
        schemas[schema.name] = faker.datatype.float();
      } else if (schema.type === 'INTEGER' || schema.type === 'INT64') {
        schemas[schema.name] = faker.datatype.number();
      } else {
        console.log('nothing');
      }
    });
    console.log('get our schemas, ', schemas);
    return schemas;
  } catch (e) {
    console.log(e);
  }
}

export function loop(number) {
  let data = [];
  for (let i = 0; i < number; i++) {
    data.push(createFakeData());
  }
  console.log('our data', JSON.stringify(data));
  return data;
}

async function insertRowsAsStream() {
  // Inserts the JSON objects
  const datasetId = 'samples_au';
  const tableId = 'traffic_guard';
  const rows = loop(1);

  // Insert data into a table
  // await bigquery.dataset(datasetId).table(tableId).insert(rows);
  console.log(`Inserted ${rows.length} rows`);
}

insertRowsAsStream();
