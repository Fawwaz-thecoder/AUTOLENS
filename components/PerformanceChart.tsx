
import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import { CarSpecs } from '../types';

interface Props {
  specs: CarSpecs;
}

const PerformanceChart: React.FC<Props> = ({ specs }) => {
  // Normalize data for radar chart (rough estimation/scaling for visualization)
  const data = [
    { subject: 'HP', A: Math.min(100, (specs.horsepower / 1000) * 100), fullMark: 100 },
    { subject: 'Torque', A: Math.min(100, (specs.torque / 1000) * 100), fullMark: 100 },
    { subject: 'Acceleration', A: Math.max(0, 100 - (specs.zeroToSixty * 10)), fullMark: 100 },
    { subject: 'Top Speed', A: Math.min(100, (specs.topSpeed / 250) * 100), fullMark: 100 },
    { subject: 'Efficiency', A: specs.fuelEconomy.includes('Electric') ? 100 : 40, fullMark: 100 },
  ];

  return (
    <div className="w-full h-64 md:h-80 bg-slate-800/50 rounded-xl p-4 border border-slate-700">
      <h3 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider">Performance Profile</h3>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#475569" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
          <PolarRadiusAxis axisLine={false} tick={false} />
          <Radar
            name="Performance"
            dataKey="A"
            stroke="#38bdf8"
            fill="#38bdf8"
            fillOpacity={0.6}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PerformanceChart;
