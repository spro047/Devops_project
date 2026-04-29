import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const InventoryChart = ({ products }) => {
  if (!products || products.length === 0) return null;

  const data = {
    labels: products.map(p => p.name),
    datasets: [
      {
        label: 'Quantity in Stock',
        data: products.map(p => p.quantity),
        backgroundColor: products.map(p => 
          p.status === 'Out of Stock' ? 'rgba(239, 68, 68, 0.7)' : 
          p.status === 'Low Stock' ? 'rgba(245, 158, 11, 0.7)' : 
          'rgba(99, 102, 241, 0.7)'
        ),
        borderColor: products.map(p => 
          p.status === 'Out of Stock' ? '#ef4444' : 
          p.status === 'Low Stock' ? '#f59e0b' : 
          '#6366f1'
        ),
        borderWidth: 1,
        borderRadius: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#f1f5f9',
        bodyColor: '#94a3b8',
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: '#94a3b8',
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#94a3b8',
        }
      }
    },
  };

  return (
    <div style={{ height: '300px', marginTop: '1rem' }}>
      <Bar data={data} options={options} />
    </div>
  );
};

export default InventoryChart;
