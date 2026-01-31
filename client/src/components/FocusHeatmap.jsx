import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { Tooltip } from 'react-tooltip';
import { subDays } from 'date-fns';

export default function FocusHeatmap({ data }) {
  const today = new Date();
  
  // 1. Process Data: Map dates to total "focused" hours
  const heatmapData = data.map(entry => {
    let totalFocus = 0;
    
    // Support both old data structure (object) and new (array of sessions)
    if (entry.sessions && Array.isArray(entry.sessions)) {
       totalFocus = entry.sessions.reduce((acc, s) => acc + (Number(s.focused) || 0), 0);
    } else if (entry.data) {
       totalFocus = Object.values(entry.data).reduce((acc, val) => acc + (val.focused || 0), 0);
    }
    
    return { date: entry.date, count: totalFocus };
  });

  return (
    <div className="w-full">
      <CalendarHeatmap
        startDate={subDays(today, 365)} 
        endDate={today}
        values={heatmapData}
        classForValue={(value) => {
          if (!value || value.count === 0) return 'color-empty';
          // Define your intensity thresholds here
          if (value.count >= 10) return 'color-scale-4'; // God Mode (10h+)
          if (value.count >= 7)  return 'color-scale-3'; // Deep Work (7h+)
          if (value.count >= 4)  return 'color-scale-2'; // Solid Day (4h+)
          return 'color-scale-1';                        // Light Day (<4h)
        }}
        tooltipDataAttrs={(value) => {
          if (!value || !value.date) return null;
          return {
            'data-tooltip-id': 'heatmap-tooltip',
            'data-tooltip-content': `${value.date}: ${value.count.toFixed(1)} hrs`,
          };
        }}
        showWeekdayLabels={true}
        gutterSize={3} // Nice spacing between squares
      />
      
      {/* Tooltip Configuration */}
      <Tooltip 
        id="heatmap-tooltip" 
        style={{ 
          backgroundColor: "#09090b", 
          color: "#22c55e", 
          border: "1px solid #333",
          borderRadius: "8px",
          fontSize: "12px",
          fontWeight: "bold"
        }} 
      />
      
      {/* THE COLOR PALETTE 
         We override the default library colors here to match your FocusOS "Matrix" Theme.
      */}
      <style>{`
        .react-calendar-heatmap { width: 100%; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
        .react-calendar-heatmap text { font-size: 10px; fill: #52525b; } /* Zinc-600 Labels */
        
        /* Empty Day (Black/Zinc) */
        .react-calendar-heatmap .color-empty { fill: #18181b; outline: 1px solid #27272a; rx: 2px; }
        
        /* Scale 1: Low Effort (Dark Green) */
        .react-calendar-heatmap .color-scale-1 { fill: #14532d; rx: 2px; } 
        
        /* Scale 2: Medium Effort (Standard Green) */
        .react-calendar-heatmap .color-scale-2 { fill: #15803d; rx: 2px; }
        
        /* Scale 3: High Effort (Bright Green) */
        .react-calendar-heatmap .color-scale-3 { fill: #22c55e; rx: 2px; }
        
        /* Scale 4: God Mode (Neon/White-Green) */
        .react-calendar-heatmap .color-scale-4 { fill: #86efac; rx: 2px; }
      `}</style>
    </div>
  );
}