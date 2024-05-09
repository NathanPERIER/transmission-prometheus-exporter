

import { ApiStatus } from '../server/status.js';


export interface MetricsPoint {
    status: ApiStatus;
    active_torrent_count: number;
    paused_torrent_count: number;
    session_count: number;
    run_time: number;
    torrents_added_count: number;
    downloaded_bytes: number;
    uploaded_bytes: number;
    download_speed: number;
    upload_speed: number;
};
