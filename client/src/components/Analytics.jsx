import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { format, subDays, parseISO, eachDayOfInterval } from 'date-fns';
import { Activity, PieChart as PieIcon, Calendar, TrendingUp } from 'lucide-react';

// Theme Colors
const COLORS = ['#22c55e', '#3b82f6', '#eab308', '#ef4444', '#a855f7', '#ec4899'];
const PRIMARY = '#22c55e'; // Green
const BG_DARK = '#18181b'; // Zinc 900

export default function Analytics() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Processed Datasets
  const [barData, setBarData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [lineData, setLineData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/focus');
      const rawLogs = res.data; // Assumed sorted by date desc
      setData(rawLogs);
      processCharts(rawLogs);
      setLoading(false);
    } catch (err) {
      console.error("Analytics Error:", err);
      setLoading(false);
    }
  };

  const processCharts = (logs) => {
    // 1. BAR CHART (Execution vs Intention) - Last 7 Days
    const last7Days = logs.slice(0, 7).reverse(); // Flip to Chronological
    const bar = last7Days.map(log => ({
      date: format(parseISO(log.date), 'EEE'), // Mon, Tue
      Focused: log.sessions.reduce((acc, s) => acc + s.focused, 0),
      Target: log.sessions.reduce((acc, s) => acc + s.assigned, 0),
    }));
    setBarData(bar);

    // 2. PIE CHART (Resource Allocation) - All Time
    const categoryTotals = {};
    logs.forEach(log => {
      log.sessions.forEach(s => {
        categoryTotals[s.category] = (categoryTotals[s.category] || 0) + s.focused;
      });
    });
    const pie = Object.keys(categoryTotals).map(cat => ({
      name: cat,
      value: Number(categoryTotals[cat].toFixed(1))
    })).sort((a, b) => b.value - a.value); // Sort biggest first
    setPieData(pie);

    // 3. HEATMAP (Consistency) - Last 90 Days Grid
    // We create a map of date -> hours
    const dateMap = {};
    logs.forEach(log => {
      const hours = log.sessions.reduce((acc, s) => acc + s.focused, 0);
      dateMap[log.date] = hours;
    });
    // Generate last 90 days array
    const today = new Date();
    const range = eachDayOfInterval({ start: subDays(today, 89), end: today });
    const heat = range.map(d => {
      const iso = format(d, 'yyyy-MM-dd');
      return {
        date: iso,
        hours: dateMap[iso] || 0,
        intensity: Math.min((dateMap[iso] || 0) / 6, 1) // Cap at 6 hours for max color
      };
    });
    setHeatmapData(heat);

    // 4. LINE CHART (Deep Dives) - Category Trends (Last 14 Days)
    const last14Days = logs.slice(0, 14).reverse();
    const line = last14Days.map(log => {
      const entry = { date: format(parseISO(log.date), 'dd/MM') };
      log.sessions.forEach(s => {
        entry[s.category] = (entry[s.category] || 0) + s.focused;
      });
      return entry;
    });
    setLineData(line);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-900 border border-white/10 p-3 rounded-lg shadow-xl">
          <p className="text-white font-bold mb-1">{label}</p>
          {payload.map((p, i) => (
            <p key={i} style={{ color: p.color }} className="text-xs">
              {p.name}: {p.value}h
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) return <div className="p-10 text-center text-zinc-500 animate-pulse">Computing Efficiency Metrics...</div>;

  return (
    <div className="max-w-6xl mx-auto py-10 space-y-8 animate-in fade-in duration-500">
      
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white tracking-tight">Analytics Command</h2>
        <p className="text-zinc-400">Visualizing cognitive output and system performance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 1. EXECUTION VS INTENTION (BAR) */}
        <div className="bg-zinc-900/50 border border-white/5 p-6 rounded-3xl">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="text-green-500" />
            <h3 className="text-lg font-bold text-white">Execution vs. Intention</h3>
          </div>
          <div className="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="date" stroke="#71717a" tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }}/>
                <Bar dataKey="Focused" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="Target" fill="#3f3f46" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. RESOURCE ALLOCATION (PIE) */}
        <div className="bg-zinc-900/50 border border-white/5 p-6 rounded-3xl">
          <div className="flex items-center gap-2 mb-6">
            <PieIcon className="text-blue-500" />
            <h3 className="text-lg font-bold text-white">Resource Allocation (Total)</h3>
          </div>
          <div className="h-64 w-full text-xs flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0)" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" layout="vertical" verticalAlign="middle" align="right" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* 3. CONSISTENCY HEATMAP (GRID) */}
      <div className="bg-zinc-900/50 border border-white/5 p-6 rounded-3xl">
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="text-yellow-500" />
          <h3 className="text-lg font-bold text-white">Consistency Heatmap (90 Days)</h3>
        </div>
        <div className="flex flex-wrap gap-1 justify-center md:justify-start">
          {heatmapData.map((day, i) => (
            <div 
              key={i}
              title={`${day.date}: ${day.hours.toFixed(1)}h`}
              className={`w-3 h-3 md:w-4 md:h-4 rounded-sm transition-all hover:scale-125 hover:border-white border border-transparent`}
              style={{
                backgroundColor: day.hours === 0 ? '#27272a' : `rgba(34, 197, 94, ${0.2 + (day.intensity * 0.8)})`
              }}
            />
          ))}
        </div>
        <div className="flex justify-between mt-4 text-xs text-zinc-500 font-mono">
           <span>{heatmapData[0]?.date}</span>
           <span>Today</span>
        </div>
      </div>

      {/* 4. TOPIC TRENDS (LINE) */}
      <div className="bg-zinc-900/50 border border-white/5 p-6 rounded-3xl">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="text-purple-500" />
          <h3 className="text-lg font-bold text-white">Topic Velocity (Last 14 Days)</h3>
        </div>
        <div className="h-64 w-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
              <XAxis dataKey="date" stroke="#71717a" tickLine={false} axisLine={false} />
              <YAxis stroke="#71717a" tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{stroke: 'rgba(255,255,255,0.1)'}} />
              <Legend />
              {/* Dynamically create lines for available keys (excluding 'date') */}
              {lineData.length > 0 && Object.keys(lineData[0])
                .filter(key => key !== 'date')
                .map((key, index) => (
                  <Line 
                    key={key}
                    type="monotone" 
                    dataKey={key} 
                    stroke={COLORS[index % COLORS.length]} 
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6 }} 
                  />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}