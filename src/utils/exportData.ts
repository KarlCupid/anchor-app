import { getAllSessions, getExposures } from '../db';

export const exportToJSON = async () => {
    const [sessions, exposures] = await Promise.all([
        getAllSessions(),
        getExposures(),
    ]);

    const data = {
        exportDate: new Date().toISOString(),
        exposures,
        sessions,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `anchor-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
};

export const exportToCSV = async () => {
    const sessions = await getAllSessions();

    // CSV headers
    const headers = [
        'Session Date',
        'Duration (min)',
        'SUDS Start',
        'SUDS End',
        'SUDS Reduction',
        'Outcome',
        'Reflection',
    ];

    // CSV rows
    const rows = sessions.map((session) => [
        new Date(session.startedAt).toLocaleDateString(),
        Math.floor((session.durationSeconds || 0) / 60).toString(),
        session.sudsStart.toString(),
        (session.sudsEnd || '').toString(),
        (session.sudsStart - (session.sudsEnd || 0)).toString(),
        session.outcome,
        `"${(session.reflection || '').replace(/"/g, '""')}"`, // Escape quotes
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `anchor-sessions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
};
