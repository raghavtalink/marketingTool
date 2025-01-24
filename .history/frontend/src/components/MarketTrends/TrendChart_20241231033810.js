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
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="price" stroke="#8884d8" name="Price" />
          <Line type="monotone" dataKey="marketAverage" stroke="#82ca9d" name="Market Average" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrendChart;