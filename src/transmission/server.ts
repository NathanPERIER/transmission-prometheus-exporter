
import { MetricsPoint } from './metrics_point.js';
import { ApiStatus } from '../server/status.js';
import axios from 'axios';

const API_RPC_PATH = 'transmission/rpc';
const API_RPC_METRICS_METHOD = 'session-stats';


export type RpcRawResponse<RawContent> = {
    arguments: RawContent,
    result: string;
};

export type MetricsRawResponse = {
    "activeTorrentCount": number;
    "pausedTorrentCount": number;
    "cumulative-stats": {
        "downloadedBytes": number,
        "filesAdded": number,
        "secondsActive": number,
        "sessionCount": number,
        "uploadedBytes": number
    };
    "downloadSpeed": number;
    "uploadSpeed": number;
};



export class TransmissionServer {

    public readonly label: string;
    public readonly base_url: string;
    private readonly auth_header: string | null;
    private session_id: string = '';

    public constructor(label: string, user_pass: {username: string, password: string} | null, base_url: string) {
        if(!base_url.endsWith('/')) {
            base_url += '/';
        }
        this.label = label;
        this.base_url = base_url;
        if(user_pass === null) {
            this.auth_header = null;
        } else {
            this.auth_header = "Basic " + Buffer.from(`${user_pass.username}:${user_pass.password}`).toString('base64');
        }
    }

    private async raw_rpc_call<RetType>(rpc_method: string): Promise<[ApiStatus,RetType?]> {
        const url = this.base_url + API_RPC_PATH;
        let retry_auth = true;
        try {
            while(true) {
                const rsp = await axios.post<RpcRawResponse<RetType>>(url, 
                    { method: rpc_method },
                    {
                        headers: {
                            'Authorization': this.auth_header,
                            'X-Transmission-Session-Id': this.session_id,
                            'Content-Type': 'application/json',
                            'Cache-Control': 'no-cache'
                        },
                        validateStatus: null
                    }
                );
                if(rsp.status === 409) {
                    if(retry_auth) {
                        retry_auth = false;
                        let session_id = rsp.headers['x-transmission-session-id'];
                        if(session_id !== undefined) {
                            console.log('Updated Transmission session ID');
                            this.session_id = session_id;
                            continue;
                        }
                    }
                    console.error(`Could not retrieve the Transmission session id (headers=${rsp.headers})`);
                    return [ApiStatus.AUTH_ERROR, undefined];
                } 
                if(rsp.status < 200 || rsp.status >= 300) {
                    console.error(`Got HTTP return code ${rsp.status} ${rsp.statusText} on request to "${url}"`);
                    return [ApiStatus.HTTP_ERROR, undefined];
                }
                const body = rsp.data;
                if(body.result !== 'success') {
                    console.warn(`Got error result "${body.result}" from API on request to "${url}"`);
                    return [ApiStatus.API_ERROR, undefined];
                }
                return [ApiStatus.OK, body.arguments];
            }
        } catch (err) {
            if(err instanceof axios.AxiosError) {
                console.warn(`Got error from Axios during a request to "${url}" : ${err.message}`);
            } else {
                console.warn(`Got unknown error of type ${typeof err} during a request to "${url}"`);
            }
            return [ApiStatus.UNREACHABLE, undefined];
        }
    }


    public async get_metrics(): Promise<MetricsPoint> {
        const [status, data] = await this.raw_rpc_call<MetricsRawResponse>(API_RPC_METRICS_METHOD);
        let res: MetricsPoint = {
            status: status,
            active_torrent_count: 0,
            paused_torrent_count: 0,
            session_count: 0,
            run_time: 0,
            torrents_added_count: 0,
            downloaded_bytes: 0,
            uploaded_bytes: 0,
            download_speed: 0,
            upload_speed: 0
        };
        if(status !== ApiStatus.OK || data === undefined) {
            return res;
        }
        res.active_torrent_count = data.activeTorrentCount;
        res.paused_torrent_count = data.pausedTorrentCount;
        res.session_count = data['cumulative-stats'].sessionCount;
        res.run_time = data['cumulative-stats'].secondsActive;
        res.torrents_added_count = data['cumulative-stats'].filesAdded;
        res.downloaded_bytes = data['cumulative-stats'].downloadedBytes;
        res.uploaded_bytes = data['cumulative-stats'].uploadedBytes;
        res.download_speed = data.downloadSpeed;
        res.upload_speed = data.uploadSpeed
        return res;
    }
    
}
