import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingDown } from 'lucide-react';
import type { SUDSEntry } from '../../db';

interface SUDSMiniChartProps {
    sudsLog: SUDSEntry[];
}

export const SUDSMiniChart = ({ sudsLog }: SUDSMiniChartProps) => {
    if (sudsLog.length === 0) {
        return null;
    }

    const data = sudsLog.map((entry, index) => ({
        index: index + 1,
        suds: entry.value,
        time: new Date(entry.timestamp).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
        }),
    }));

    const latestSuds = sudsLog[sudsLog.length - 1]?.value || 0;
    const initialSuds = sudsLog[0]?.value || 0;
    const reduction = initialSuds - latestSuds;

    return (
        <div className="card bg-gradient-to-br from-green-50 to-emerald-50">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <TrendingDown size={24} className="text-green-600" />
                    <h3 className="heading text-lg">SUDS Progress</h3>
                </div>
                <div className="text-right">
                    <p className="text-sm text-muted">Reduction</p>
                    <p className={`text-2xl font-bold ${reduction >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {reduction >= 0 ? '-' : '+'}{Math.abs(reduction)}
                    </p>
                </div>
            </div>

            <ResponsiveContainer width="100%" height={200}>
                <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                        dataKey="time"
                        tick={{ fontSize: 12 }}
                        stroke="#9ca3af"
                    />
                    <YAxis
                        domain={[0, 10]}
                        ticks={[0, 2, 4, 6, 8, 10]}
                        tick={{ fontSize: 12 }}
                        stroke="#9ca3af"
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'white',
                            border: '2px solid #10b981',
                            borderRadius: '8px',
                        }}
                    />
                    <Line
                        type="monotone"
                        dataKey="suds"
                        stroke="#10b981"
                        strokeWidth={3}
                        dot={{ fill: '#10b981', r: 5 }}
                        activeDot={{ r: 7 }}
                    />
                </LineChart>
            </ResponsiveContainer>

            <p className="text-sm text-muted text-center mt-2">
                {sudsLog.length} {sudsLog.length === 1 ? 'entry' : 'entries'} logged
            </p>
        </div>
    );
};
