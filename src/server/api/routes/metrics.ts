import app from '../../core.js';
import { PrometheusDocument } from '../../../prometheus/builder.js';
import { TransmissionServer } from '../../../transmission/server.js';
// import { MetricsPoint } from '../../../transmission/metrics_point.js';
import { ApiStatus } from '../../status.js';
import { SERVER } from '../../../utils/env.js';



async function get_document(server: TransmissionServer): Promise<PrometheusDocument> {
    const metrics = await server.get_metrics();

    let document = new PrometheusDocument();

    document.add_gauge('transmission_server_url', 'Associates a server\'s name/label/identifier to a base url.', [[{'server': SERVER.label, 'base_url': SERVER.base_url}, 1]]);

    document.add_gauge('transmission_status', 'Status of the connection to the server.', [[{'server': SERVER.label}, metrics.status]]);

    if(metrics.status !== ApiStatus.OK) {
        return document;
    }

    metrics.active_torrent_count

    document.add_gauge('transmission_active_torrent_count', 'Number of seeding/downloading torrents on the server.', [[{'server': SERVER.label}, metrics.active_torrent_count]]);
    document.add_gauge('transmission_paused_torrent_count', 'Number of paused torrents on the server.', [[{'server': SERVER.label}, metrics.paused_torrent_count]]);
    
    document.add_gauge('transmission_session_count', 'Number of sessions created since the server started.', [[{'server': SERVER.label}, metrics.session_count]]);

    document.add_counter('transmission_server_run_time', 'Total duration for which the server has been running since the beginning (in seconds).', [[{'server': SERVER.label}, metrics.run_time]]);

    document.add_counter('transmission_torrents_added_count', 'Total number of torrents (including the ones that were deleted).', [[{'server': SERVER.label}, metrics.torrents_added_count]]);

    document.add_counter('transmission_downloaded_bytes', 'Total size of downloaded content.', [[{'server': SERVER.label}, metrics.downloaded_bytes]]);
    document.add_counter('transmission_uploaded_bytes', 'Total size of seeded content.', [[{'server': SERVER.label}, metrics.uploaded_bytes]]);

    document.add_counter('transmission_download_speed', 'Download speed in bytes/s.', [[{'server': SERVER.label}, metrics.download_speed]]);
    document.add_counter('transmission_upload_speed', 'Upload speed in bytes/s.', [[{'server': SERVER.label}, metrics.upload_speed]]);

    return document;
}


app.get('/metrics', async (_req, res) => {

    const document = await get_document(SERVER);

    console.log(`Exporting ${document.nb_groups()} groups, totalling ${document.nb_points()} metric points`);

    res.type('text/plain');
    res.send(document.format());
});
