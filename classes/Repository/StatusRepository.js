"use strict";

let MySQL = require(`mysql`);

module.exports = class StatusRepository {
  constructor(statusCollectionMapper) {
    this.statusCollectionMapper = statusCollectionMapper;
  }

  getAll(callback) {
    let that = this;
    let connection = MySQL.createConnection(mySQLCredentials);

    connection.query(`SELECT \`id\`, \`person\`, \`state\`, \`platform\`, \`datetime\` FROM \`status\` WHERE 1 ORDER BY \`datetime\` DESC`, function(error, statusArray) {
      connection.end();
      callback(that.statusCollectionMapper.createAndMap(statusArray));
    });
  }

  getByPerson(personId, callback) {
    let that = this;
    let connection = MySQL.createConnection(mySQLCredentials);

    connection.query(`SELECT \`id\`, \`person\`, \`state\`, \`platform\`, \`datetime\` FROM \`status\` WHERE \`person\` = ${personId} ORDER BY \`datetime\` DESC`, function(error, statusArray) {
      connection.end();
      callback(that.statusCollectionMapper.createAndMap(statusArray));
    });
  }

  saveStatus(status, callback) {
    let that = this;
    let connection = MySQL.createConnection(mySQLCredentials);

    let query = `INSERT INTO \`status\` (`;
    if (typeof(status.state) !== `undefined`) query += `\`state\`, `;
    if (typeof(status.person) !== `undefined`) query += `\`person\`, `;
    if (typeof(status.platform) !== `undefined`) query += `\`platform\`, `;
    query = `${query.substring(0, query.length - 2)} ) VALUES (`;

    if (typeof(status.state) !== `undefined`) query += `'${status.state}', `;
    if (typeof(status.person) !== `undefined`) query += `'${status.person}', `;
    if (typeof(status.platform) !== `undefined`) query += `'${status.platform}', `;

    query = `${query.substring(0, query.length - 2)})`;

    connection.query(query, function(error, statusArray) {
      connection.end();
      callback(status);
    });
  }
}