"use strict";
/** Database setup for jobly. */
const { Client } = require("pg");
const dotenv = require('dotenv');
const { getDatabaseUri } = require('./config');
dotenv.config();

let ssl = null;

if (process.env.NODE_ENV === 'production') {
	ssl = {
		rejectUnauthorized: false,
	};
}

const { USER, HOST, PASSWORD, PORT } = process.env;

let db = new Client({
	user: USER,
	host: HOST,
	database: getDatabaseUri(),
	password: PASSWORD,
	port: PORT,
	ssl: ssl,
});

db.connect();

module.exports = db;