import React from 'react';
import { Stat } from '../types';
import { Icons } from './Icon';

interface StatCardProps {
  stat: Stat;
}

export const StatCard: React.FC<StatCardProps> = ({ stat }) => {
  const isPositive = stat.trendDirection === 'up';
  
  return (
    <div className="bg-white dark:bg-gray-850 border border-gray-200 dark:border-gray-750 p-5 rounded-xl shadow-sm transition-colors duration-200">
      <div className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-2">{stat.countLabel || stat.label}</div>
      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{stat.value}</div>
      <div className="flex items-center text-xs">
        <span className="text-gray-500 dark:text-gray-400 mr-2">vs last week</span>
        <span className={`font-medium flex items-center ${isPositive ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
          {isPositive ? '+' : '-'}{Math.abs(stat.trend)}%
          {isPositive ? <Icons.ArrowUp size={14} className="ml-0.5" /> : <Icons.ArrowDown size={14} className="ml-0.5" />}
        </span>
      </div>
    </div>
  );
};