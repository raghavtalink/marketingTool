// src/components/Common/TimeframeSelector.js

import React from 'react';
import './CommonComponents.css';

const TimeframeSelector = ({ timeframe, onChange }) => {
  return (
    <div className="selector-group">
      <label htmlFor="timeframe-select">Time Period</label>
      <select
        id="timeframe-select"
        value={timeframe}
        onChange={(e) => onChange(e.target.value)}
        className="selector-input"
      >
        <option value="current">Current</option>
        <option value="3_months">Last 3 Months</option>
        <option value="6_months">Last 6 Months</option>
        <option value="1_year">Last Year</option>
      </select>
    </div>
  );
};

export default TimeframeSelector;