import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  BarController
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { getMonthlySpending, getSpendingSummary } from '../../services/api';
import { formatNumber } from '../../utils/mathUtils';
import { useAuth } from '../../contexts/AuthContext/AuthContext';
import './TransactionCharts.css';
import PropTypes from 'prop-types';
import { formatError } from '../../utils/errorHandler';
import { withErrorBoundary } from '../ErrorBoundary/ErrorBoundary';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const TransactionCharts = ({ filters }) => {
  const [monthlySpending, setMonthlySpending] = useState(null);
  const [spendingSummary, setSpendingSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const { locale } = useAuth();
  const [error, setError] = useState('');

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  useEffect(() => {
    fetchAllData();
  }, [selectedYear, filters]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const apiFilters = {
        year: selectedYear,
        ...filters,
      };

      const dateFilters = {
        startDate: `${selectedYear}-01-01`,
        endDate: `${selectedYear}-12-31`,
        ...filters,
      };

      const [monthly, summary] = await Promise.all([
        getMonthlySpending(apiFilters),
        getSpendingSummary(dateFilters)
      ]);

      setMonthlySpending(monthly.monthlySummary);
      setSpendingSummary(summary);
    } catch (error) {
      const formattedError = formatError(error);
      setError(formattedError.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !monthlySpending || !spendingSummary) {
    return <div className="charts-loading">Loading charts...</div>;
  }

  // Monthly spending by card data
  const monthlySpendingByCard = {
    labels: months,
    datasets: monthlySpending.reduce((acc, month) => {
      month.cards.forEach(card => {
        const existingDataset = acc.find(ds => ds.label === card.cardName);
        if (existingDataset) {
          existingDataset.data[month._id - 1] = Math.abs(card.total);
        } else {
          const newDataset = {
            label: `${card.cardName} (*${card.lastFourDigits})`,
            data: Array(12).fill(0),
            backgroundColor: `hsla(${Math.random() * 360}, 70%, 50%, 0.8)`,
          };
          newDataset.data[month._id - 1] = Math.abs(card.total);
          acc.push(newDataset);
        }
      });
      return acc;
    }, [])
  };

  // Category breakdown data with subcategories
  const categoryData = {
    labels: spendingSummary.map(item => item._id),
    datasets: [{
      label: 'Total Spending by Category',
      data: spendingSummary.map(item => Math.abs(item.total)),
      backgroundColor: spendingSummary.map((_, index) =>
        `hsla(${(index * 360) / spendingSummary.length}, 70%, 50%, 0.8)`
      ),
      borderWidth: 1,
    }]
  };

  // Subcategory breakdown data
  const subcategoryData = {
    labels: spendingSummary.flatMap(category =>
      category.subcategories
        .filter(sub => sub.subcategory) // Filter out empty subcategories
        .map(sub => `${category._id}: ${sub.subcategory || 'General'}`)
    ),
    datasets: [{
      label: 'Spending by Subcategory',
      data: spendingSummary.flatMap(category =>
        category.subcategories
          .filter(sub => sub.subcategory)
          .map(sub => Math.abs(sub.total))
      ),
      backgroundColor: spendingSummary.flatMap(category =>
        category.subcategories
          .filter(sub => sub.subcategory)
          .map((_, index) => `hsla(${Math.random() * 360}, 70%, 50%, 0.8)`)
      ),
      borderWidth: 1,
    }]
  };

  return (
    <div className="charts-container">
      <div className="charts-header">
        <h2>Transaction Analytics</h2>
        {error && <div className="error-message">{error}</div>}
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="year-selector"
        >
          {[...Array(5)].map((_, i) => {
            const year = new Date().getFullYear() - i;
            return (
              <option key={year} value={year}>
                {year}
              </option>
            );
          })}
        </select>
      </div>

      <div className="chart-row">
        <div className="chart-card">
          <h3>Spending by Category</h3>
          <div className="chart-wrapper">
            <Doughnut
              data={categoryData}
              options={{
                plugins: {
                  legend: {
                    position: 'right',
                    labels: {
                      generateLabels: (chart) => {
                        const data = chart.data;
                        return data.labels.map((label, i) => ({
                          text: `${label} (${formatNumber(data.datasets[0].data[i], locale)})`,
                          fillStyle: data.datasets[0].backgroundColor[i],
                          hidden: false,
                          index: i
                        }));
                      }
                    }
                  },
                  tooltip: {
                    callbacks: {
                      label: (context) => {
                        const value = context.raw;
                        const count = spendingSummary[context.dataIndex].count;
                        return [
                          ` ${formatNumber(value, locale)}`,
                          ` Count: ${count} transactions`
                        ];
                      },
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="chart-card">
          <h3>Spending by Subcategory</h3>
          <div className="chart-wrapper">
            <Doughnut
              data={subcategoryData}
              options={{
                plugins: {
                  legend: {
                    position: 'right',
                    labels: {
                      generateLabels: (chart) => {
                        const data = chart.data;
                        return data.labels.map((label, i) => ({
                          text: `${label} (${formatNumber(data.datasets[0].data[i], locale)})`,
                          fillStyle: data.datasets[0].backgroundColor[i],
                          hidden: false,
                          index: i
                        }));
                      }
                    }
                  },
                  tooltip: {
                    callbacks: {
                      label: (context) => {
                        const value = context.raw;
                        return ` ${formatNumber(value, locale)}`;
                      },
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      <div className="chart-card full-width">
        <h3>Monthly Spending by Card</h3>
        <div className="chart-wrapper">
          <Bar
            data={monthlySpendingByCard}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
                tooltip: {
                  callbacks: {
                    label: (context) => {
                      const value = context.raw;
                      return ` ${formatNumber(value, locale)}`;
                    },
                  },
                },
              },
              scales: {
                x: {
                  stacked: true,
                },
                y: {
                  stacked: true,
                  ticks: {
                    callback: (value) => formatNumber(value, locale),
                  },
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

TransactionCharts.propTypes = {
  filters: PropTypes.shape({
    cardIds: PropTypes.arrayOf(PropTypes.string),
    startDate: PropTypes.string,
    endDate: PropTypes.string,
    type: PropTypes.string,
    category: PropTypes.string,
    subcategory: PropTypes.string,
    minAmount: PropTypes.number,
    maxAmount: PropTypes.number
  })
};

TransactionCharts.defaultProps = {
  filters: {}
};

export default withErrorBoundary(TransactionCharts);