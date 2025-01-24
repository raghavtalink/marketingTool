// src/components/MarketTrends/TrendChart.js

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import './TrendChart.css';

const TrendChart = ({ data }) => {
    if (!data || data.length === 0) return <p>No trend data available.</p>;
  
    return (
      <div className="trend-chart">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={['auto', 'auto']} />
            <Tooltip 
              formatter={(value) => [`$${value}`, '']}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="#8884d8" 
              name="Product Price" 
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="marketAverage" 
              stroke="#82ca9d" 
              name="Market Average"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

export default TrendChart;