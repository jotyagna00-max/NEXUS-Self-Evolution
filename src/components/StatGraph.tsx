import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { UserStats } from '../types';

interface StatGraphProps {
  stats: UserStats;
  statsHistory?: { date: string; stats: UserStats }[];
}

const StatGraph: React.FC<StatGraphProps> = ({ stats, statsHistory }) => {
  const generateData = () => {
    if (statsHistory && statsHistory.length > 0) {
      return statsHistory.map((entry) => ({
        name: entry.date,
        intelligence: entry.stats.intelligence,
        strength: entry.stats.strength,
        agility: entry.stats.agility,
        vitality: entry.stats.vitality,
      }));
    }
    const days = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];
    return days.map((day) => ({
      name: day,
      intelligence: stats.intelligence,
      strength: stats.strength,
      agility: stats.agility,
      vitality: stats.vitality,
    }));
  };

  const data = generateData();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass p-4 border border-emerald-500/30 rounded-xl shadow-2xl">
          <p className="text-[10px] font-display uppercase tracking-widest text-emerald-400 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex justify-between gap-4 items-center">
              <span className="text-[8px] uppercase text-white/40 font-display">{entry.name}</span>
              <span className="text-[10px] font-mono text-white">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[300px] mt-6 p-6 glass rounded-2xl border border-white/10 relative overflow-hidden group">
      <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="flex justify-between items-center mb-6 relative z-10">
        <div className="space-y-1">
          <h3 className="text-[10px] font-display uppercase tracking-[0.3em] text-emerald-400">Neural Evolution Graph</h3>
          <p className="text-[8px] text-white/30 uppercase tracking-widest">7-Day Progress Analysis</p>
        </div>
        <div className="flex gap-2">
          {['INT', 'STR', 'AGI', 'VIT'].map((label, i) => (
            <div key={label} className="flex items-center gap-1">
              <div className={`w-1.5 h-1.5 rounded-full ${['bg-emerald-500', 'bg-blue-500', 'bg-purple-500', 'bg-yellow-500'][i]}`} />
              <span className="text-[7px] text-white/40 font-display">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="h-[200px] w-full relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorInt" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorStr" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 8, fontFamily: 'Inter' }}
              dy={10}
            />
            <YAxis 
              hide 
              domain={[0, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="intelligence" 
              name="Intelligence"
              stroke="#10b981" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorInt)" 
            />
            <Area 
              type="monotone" 
              dataKey="strength" 
              name="Strength"
              stroke="#3b82f6" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorStr)" 
            />
            <Line 
              type="monotone" 
              dataKey="agility" 
              name="Agility"
              stroke="#a855f7" 
              strokeWidth={2}
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="vitality" 
              name="Vitality"
              stroke="#eab308" 
              strokeWidth={2}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StatGraph;
