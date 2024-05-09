
import { TransmissionServer } from "../transmission/server.js";

const defaults: {[name: string]: string} = {
	'TRANSMISSION_EXPORTER_REQUIRE_AUTHENTICATION': 'false',
	'TRANSMISSION_EXPORTER_PORT': '8080'
}

function get_env(name: string): string {
	if(name in process.env) {
		return process.env[name] as string;
	}
	if(name in defaults) {
		return defaults[name];
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


async function read_server_from_env(): Promise<TransmissionServer> {
	return new TransmissionServer(
		get_env('TRANSMISSION_EXPORTER_SERVER_NAME'),
		get_env('TRANSMISSION_EXPORTER_USERNAME'),
		get_env('TRANSMISSION_EXPORTER_PASSWORD'),
		get_env('TRANSMISSION_EXPORTER_SERVER_BASE_URL')
	);
}


export const REQUIRE_AUTHENTICATION = (get_env('TRANSMISSION_EXPORTER_REQUIRE_AUTHENTICATION') === 'true');
export const PORT                   = get_env_uint('TRANSMISSION_EXPORTER_PORT');
export const SERVER                 = await read_server_from_env();
