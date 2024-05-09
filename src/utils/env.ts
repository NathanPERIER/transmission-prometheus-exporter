
import { TransmissionServer } from "../transmission/server.js";
import { readFileSync } from 'fs';

const defaults: {[name: string]: string} = {
	'TRANSMISSION_EXPORTER_REQUIRE_AUTHENTICATION': 'false',
	'TRANSMISSION_EXPORTER_PORT': '8080'
}

function get_env_opt(name: string): string | undefined {
	if(name in process.env) {
		return process.env[name] as string;
	}
	if(name in defaults) {
		return defaults[name];
	}
	return undefined;
}

function get_env(name: string): string {
	const res = get_env_opt(name);
	if(res !== undefined) {
		return res;
	}
	throw Error("No value provided for environment variable " + name);
}

function get_env_uint(name: string): number {
	let repr = get_env(name);
	let res = Number(repr);
	if(Number.isNaN(res) || !Number.isFinite(res) || !Number.isInteger(res) || res < 0) {
		throw Error("Bad unsigned integer provided for environment variable " + name);
	}
	return res;
}


function read_server_from_env(): TransmissionServer {
	const label = get_env('TRANSMISSION_EXPORTER_SERVER_NAME');
	const base_url = get_env('TRANSMISSION_EXPORTER_SERVER_BASE_URL');
	let user_pass = null;
	const username = get_env_opt('TRANSMISSION_EXPORTER_USERNAME');
	const password = get_env_opt('TRANSMISSION_EXPORTER_PASSWORD');
	const password_file = get_env_opt('TRANSMISSION_EXPORTER_PASSWORD_FILE');
	if(username !== undefined) {
		if(password !== undefined) {
			user_pass = {username: username, password: password};
		} else if(password_file !== undefined) {
			user_pass = {username: username, password: readFileSync(password_file, {encoding: 'utf-8'})};
		} else {
			throw Error("Missing password or password file");
		}
	} else if(password !== undefined || password_file !== undefined) {
		throw Error("Missing username");
	}
	return new TransmissionServer(
		label,
		user_pass,
		base_url
	);
}


export const REQUIRE_AUTHENTICATION = (get_env('TRANSMISSION_EXPORTER_REQUIRE_AUTHENTICATION') === 'true');
export const PORT                   = get_env_uint('TRANSMISSION_EXPORTER_PORT');
export const SERVER                 = read_server_from_env();
