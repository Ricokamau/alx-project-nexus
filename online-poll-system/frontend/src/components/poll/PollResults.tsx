import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Poll } from '../../types';
import './PollResults.css';

interface PollResultsProps {
  poll: Poll;
  showTitle?: boolean;
  refreshResults?: () => void;
  isRefreshing?: boolean;
}

const PollResults: React.FC<PollResultsProps> = ({ 
  poll, 
  showTitle = true,
  refreshResults,
  isRefreshing = false
}) => {
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');

  // Prepare chart data
  const chartData = poll.options.map((option, index) => {
    const percentage = poll.total_votes > 0 
      ? ((option.vote_count / poll.total_votes) * 100) 
      : 0;
    
    return {
      name: option.text.length > 20 ? `${option.text.substring(0, 20)}...` : option.text,
      fullName: option.text,
      votes: option.vote_count,
      percentage: Number(percentage.toFixed(1)),
      fill: `hsl(${(index * 137.5) % 360}, 70%, 50%)` // Generate distinct colors
    };
  });

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="chart-tooltip">
          <p className="tooltip-label">{data.fullName}</p>
          <p className="tooltip-value">
            Votes: <strong>{data.votes}</strong> ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const winningOption = poll.options.reduce((prev, current) => 
    prev.vote_count > current.vote_count ? prev : current
  );

  // Create sorted options without mutating original array
  const sortedOptions = React.useMemo(() => {
    return poll.options
      .map(option => ({
        id: option.id,
        text: option.text,
        vote_count: option.vote_count
      }))
      .sort((a, b) => b.vote_count - a.vote_count);
  }, [poll.options]);

  return (
    <div className="poll-results-container">
      {showTitle && (
        <div className="results-header">
          <div className="header-content">
            <h3>Poll Results</h3>
            <div className="results-summary">
              <span className="total-votes">
                Total Votes: <strong>{poll.total_votes}</strong>
              </span>
              {poll.total_votes > 0 && (
                <span className="leading-option">
                  Leading: <strong>{winningOption.text}</strong>
                </span>
              )}
            </div>
          </div>
          
          <div className="results-controls">
            <div className="chart-toggle">
              <button
                className={`toggle-btn ${chartType === 'bar' ? 'active' : ''}`}
                onClick={() => setChartType('bar')}
              >
                📊 Bar
              </button>
              <button
                className={`toggle-btn ${chartType === 'pie' ? 'active' : ''}`}
                onClick={() => setChartType('pie')}
              >
                🥧 Pie
              </button>
            </div>
            
            {refreshResults && (
              <button
                className={`btn btn-outline-primary btn-sm ${isRefreshing ? 'loading' : ''}`}
                onClick={refreshResults}
                disabled={isRefreshing}
              >
                {isRefreshing ? '🔄' : '↻'} Refresh
              </button>
            )}
          </div>
        </div>
      )}

      {poll.total_votes === 0 ? (
        <div className="no-votes-message">
          <div className="no-votes-icon">📊</div>
          <h4>No votes yet</h4>
          <p>Be the first to vote on this poll!</p>
        </div>
      ) : (
        <div className="chart-container">
          {chartType === 'bar' ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Votes', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="votes" 
                  radius={[4, 4, 0, 0]}
                  stroke="#007bff"
                  strokeWidth={1}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="votes"
                  animationDuration={800}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value, entry: any) => (
                    <span style={{ color: entry.color }}>
                      {entry.payload.fullName} ({entry.payload.votes} votes)
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      )}

      <div className="detailed-results">
        <h4>Detailed Breakdown</h4>
        <div className="results-list">
          {sortedOptions.map((option, index) => {
            const percentage = poll.total_votes > 0 
              ? ((option.vote_count / poll.total_votes) * 100).toFixed(1)
              : '0';
            const isWinner = index === 0 && poll.total_votes > 0;
            
            return (
              <div 
                key={option.id} 
                className={`result-item ${isWinner ? 'winner' : ''}`}
              >
                <div className="result-rank">#{index + 1}</div>
                <div className="result-content">
                  <div className="result-header">
                    <span className="option-name">{option.text}</span>
                    <span className="vote-count">
                      {option.vote_count} vote{option.vote_count !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="progress-container">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: chartData.find(d => d.fullName === option.text)?.fill 
                        }}
                      />
                    </div>
                    <span className="percentage">{percentage}%</span>
                  </div>
                </div>
                {isWinner && (
                  <div className="winner-badge">👑</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PollResults;