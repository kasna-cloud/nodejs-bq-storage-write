const yaml = require('js-yaml');
const fs = require('fs');
const { BigQuery } = require('@google-cloud/bigquery');
const bigquery = new BigQuery();

const yamlSource = './data/realtime_transaction_layer_table.yaml';
const datasetId = 'samples_au';
const tableId = 'traffic_guard';

function getSchemasFromYaml() {
  // Get document, or throw exception on error
  try {
    let schemas = '';
    const doc = yaml.load(fs.readFileSync(yamlSource, 'utf8'));
    doc?.resources[0]?.properties?.schema.forEach((schema, index) => {
      // console.log(`name ${schema.name}  type ${schema.type}`);
      if (index === 0) {
        schemas = schemas.concat(`${schema.name}:${schema.type}`);
      } else {
        schemas = schemas.concat(', ', `${schema.name}:${schema.type}`);
      }
    });
    return schemas;
  } catch (e) {
    console.log(e);
  }
}

async function createTablePartitioned() {
  const schema = getSchemasFromYaml();

  // For all options, see https://cloud.google.com/bigquery/docs/reference/v2/tables#resource
  const options = {
    schema: schema,
    description: 'transaction_layer for detection and aggregation v2 reporting',
    timePartitioning: {
      field: 'dataflow_year_month_day_hour',
      requirePartitionFilter: true,
      expirationMs: '13140000000',
      type: 'HOUR',
    },
    clustering: {
      fields: [
        'root_element_tracking_metadata_organisation_identifier',
        'root_element_tracking_metadata_property_id',
        'root_element_tracking_metadata_campaign_id',
        'root_element_tracking_metadata_partner_id',
      ],
    },
  };

  // Create a new table in the dataset
  const [table] = await bigquery
    .dataset(datasetId)
    .createTable(tableId, options);
  console.log(`Table ${table.id} created with partitioning: `);
  console.log(table.metadata.timePartitioning);
  console.log(`Table ${table.id} created with clustering:`);
  console.log(table.metadata.clustering);
}
// [END bigquery_create_table_partitioned]
getSchemasFromYaml();
createTablePartitioned(datasetId, tableId);
