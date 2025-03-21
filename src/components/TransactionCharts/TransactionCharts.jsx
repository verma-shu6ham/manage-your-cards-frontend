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
import { Bar, Line, Pie } from 'react-chartjs-2';
import { getMonthlySpending, getSpendingSummary } from '../../services/api';
import { formatNumber } from '../../utils/mathUtils';
import { useAuth } from '../../contexts/AuthContext/AuthContext';
import { useTheme } from '../../contexts/ThemeContext/ThemeContext';
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
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // Default to current month
  const { locale } = useAuth();
  const { theme } = useTheme();
  const [error, setError] = useState('');
  const [isFetching, setIsFetching] = useState(false); // Add flag to prevent duplicate API calls
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [chartOptions, setChartOptions] = useState({
    pie: null,
    bar: null,
    line: null
  });

  // Determine if we're in the Monthly Expense view
  const isMonthlyExpenseView = filters && filters.category === "Monthly Expense";

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  useEffect(() => {
    // Add guard clause to prevent duplicate API calls
    if (isFetching) return;

    fetchAllData();
  }, [selectedYear, filters]);


  useEffect(() => {
    const handleResize = () => {
      // Update window width to trigger chart options update
      setWindowWidth(window.innerWidth);
      // Force chart re-render when window is resized
      setLoading(true);
      setTimeout(() => setLoading(false), 100);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Create pie chart options
    const pieOptions = {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          top: 10,
          right: 30,
          bottom: 10,
          left: 10
        }
      },
      plugins: {
        legend: {
          position: windowWidth < 768 ? 'bottom' : 'right',
          align: 'start',
          labels: {
            font: {
              size: windowWidth < 768 ? 10 : 12,
              family: "'Roboto', 'Helvetica', 'Arial', sans-serif",
              weight: 'bold'
            },
            padding: windowWidth < 768 ? 10 : 20,
            boxWidth: windowWidth < 768 ? 12 : 15,
            boxHeight: windowWidth < 768 ? 12 : 15,
            generateLabels: function (chart) {
              const data = chart.data;
              if (data.labels.length && data.datasets.length) {
                return data.labels.map((label, i) => {
                  const meta = chart.getDatasetMeta(0);
                  const style = meta.controller.getStyle(i);
                  const value = data.datasets[0].data[i];

                  // Format subcategory labels to be more readable
                  let formattedLabel = label || 'Unspecified';

                  // Make title case and replace hyphens with spaces
                  formattedLabel = formattedLabel
                    .split('-')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
                  // Add the amount in parentheses - make it more compact on mobile
                  formattedLabel = windowWidth < 768
                    ? `${formattedLabel} (${formatNumber(value, locale, 0)})`
                    : `${formattedLabel} (${formatNumber(value, locale)})`;

                  return {
                    text: formattedLabel,
                    fontColor: theme === 'dark' ? '#f0f0f0' : '#333',
                    fillStyle: style.backgroundColor,
                    strokeStyle: style.borderColor,
                    lineWidth: style.borderWidth,
                    hidden: !meta.data[i].hidden && !chart.getDataVisibility(i),
                    index: i
                  };
                });
              }
              return [];
            }
          },
          onClick: function (e, legendItem, legend) {
            legend.chart.toggleDataVisibility(legendItem.index);
            legend.chart.update();
          }
        },
        tooltip: {
          titleColor: theme === 'dark' ?  '#333' :'#f0f0f0',
          bodyColor: theme === 'dark' ? '#333' : '#f0f0f0',
          backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(50, 50, 50, 0.9)',
          borderColor: theme === 'dark' ? 'rgba(200, 200, 200, 1)' : 'rgba(70, 70, 70, 1)',
          borderWidth: 1,
          padding: 10,
          cornerRadius: 4,
          displayColors: true,
          callbacks: {
            label: function (context) {
              const label = context.label || '';
              const value = context.raw;
              return `${label}: ${formatNumber(value, locale)}`;
            }
          }
        }
      },
    };

    // Create bar chart options
    const barOptions = {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'x',
      barPercentage: 0.9,
      categoryPercentage: 0.8,
      layout: {
        padding: {
          top: 20,
          right: 20,
          bottom: 20,
          left: 20
        }
      },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: theme === 'dark' ? '#f0f0f0' : '#333',
            font: {
              size: windowWidth < 768 ? 10 : 12,
              family: "'Roboto', 'Helvetica', 'Arial', sans-serif",
              weight: 'bold'
            },
            boxWidth: windowWidth < 768 ? 12 : 15,
            boxHeight: windowWidth < 768 ? 12 : 15,
            padding: 15
          }
        },
        tooltip: {
          titleColor: theme === 'dark' ?  '#333' :'#f0f0f0',
          bodyColor: theme === 'dark' ? '#333' : '#f0f0f0',
          backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(50, 50, 50, 0.9)',
          borderColor: theme === 'dark' ? 'rgba(200, 200, 200, 1)' : 'rgba(70, 70, 70, 1)',
          borderWidth: 1,
          padding: 10,
          cornerRadius: 4,
          displayColors: true,
          callbacks: {
            label: function (context) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== undefined) {
                label += formatNumber(context.parsed.y, locale);
              }
              return label;
            }
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: theme === 'dark' ? '#f0f0f0' : '#333',
            font: {
              size: windowWidth < 768 ? 8 : 10,
              family: "'Roboto', 'Helvetica', 'Arial', sans-serif",
            },
            maxRotation: 45,
            minRotation: 45
          },
          grid: {
            color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            display: false
          }
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: theme === 'dark' ? '#f0f0f0' : '#333',
            font: {
              size: windowWidth < 768 ? 8 : 10,
              family: "'Roboto', 'Helvetica', 'Arial', sans-serif",
            },
            padding: 5,
            callback: function (value) {
              return formatNumber(value, locale, 0);
            }
          },
          grid: {
            color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          }
        }
      }
    };

    // Create line chart options
    const lineOptions = {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          top: 20,
          right: 20,
          bottom: 20,
          left: 20
        }
      },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: theme === 'dark' ? '#f0f0f0' : '#333',
            font: {
              size: windowWidth < 768 ? 10 : 12,
              family: "'Roboto', 'Helvetica', 'Arial', sans-serif",
              weight: 'bold'
            },
            padding: 15
          }
        },
        tooltip: {
          titleColor: theme === 'dark' ?  '#333' :'#f0f0f0',
          bodyColor: theme === 'dark' ? '#333' : '#f0f0f0',
          backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(50, 50, 50, 0.9)',
          borderColor: theme === 'dark' ? 'rgba(200, 200, 200, 1)' : 'rgba(70, 70, 70, 1)',
          borderWidth: 1,
          padding: 10,
          cornerRadius: 4,
          displayColors: true,
          callbacks: {
            label: function (context) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== undefined) {
                label += formatNumber(context.parsed.y, locale);
              }
              return label;
            }
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: theme === 'dark' ? '#f0f0f0' : '#333',
            font: {
              size: windowWidth < 768 ? 8 : 10,
              family: "'Roboto', 'Helvetica', 'Arial', sans-serif",
            }
          },
          grid: {
            display: false
          }
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: theme === 'dark' ? '#f0f0f0' : '#333',
            font: {
              size: windowWidth < 768 ? 8 : 10,
              family: "'Roboto', 'Helvetica', 'Arial', sans-serif",
            },
            padding: 5,
            callback: function (value) {
              return formatNumber(value, locale, 0);
            }
          },
          grid: {
            color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          }
        }
      },
    };

    // Update chart options
    setChartOptions({
      pie: pieOptions,
      bar: barOptions,
      line: lineOptions
    });

    // Force chart re-render when theme changes
    setLoading(true);
    setTimeout(() => setLoading(false), 50);
  }, [theme, windowWidth, locale]);

  const fetchAllData = async () => {
    // Set fetching flag to true before making API call
    setIsFetching(true);
    setLoading(true);

    try {
      const apiFilters = {
        year: selectedYear,
        ...filters,
      };

      const monthly = await getMonthlySpending(apiFilters);

      setMonthlySpending(monthly);
      setSpendingSummary(monthly);
    } catch (error) {
      const formattedError = formatError(error);
      setError(formattedError.message);
    } finally {
      setLoading(false);
      // Reset fetching flag when done
      setIsFetching(false);
    }
  };

  if (loading || !monthlySpending || !spendingSummary) {
    return <div className="charts-loading">Loading charts...</div>;
  }

  // Filter data based on selected month (for "All Year", we use 0)
  const filterByMonth = (data) => {
    if (selectedMonth === 0) return data; // "All Year" option
    return data.filter(item => item.month === selectedMonth);
  };

  // Get the payment method data for the selected month
  const getPaymentMethodData = () => {
    if (!monthlySpending) {
      return [];
    }

    // Handle Monthly Expense view differently
    if (isMonthlyExpenseView) {
      // For Monthly Expense view, use the legacy approach since it has different data structure
      const cardTotal = {
        _id: 'Card',
        total: 0,
        count: 0
      };

      const cashTotal = {
        _id: 'Cash',
        total: 0,
        count: 0
      };

      // Sum all card transactions (exclude any cash entries)
      if (monthlySpending.cardSummaries) {
        monthlySpending.cardSummaries.forEach(card => {
          if (card.cardId !== 'cash') {
            if (selectedMonth === 0) {
              // Full year data
              cardTotal.total += card.yearlyTotal || 0;
              cardTotal.count += card.yearlyCount || 0;
            } else {
              // Specific month data
              const monthData = card.months.find(m => m.month === selectedMonth);
              if (monthData) {
                cardTotal.total += monthData.total || 0;
                cardTotal.count += monthData.count || 0;
              }
            }
          }
        });
      }

      // Find cash transactions
      const cashCard = monthlySpending.cardSummaries && monthlySpending.cardSummaries.find(card => card.cardId === 'cash');
      if (cashCard) {
        if (selectedMonth === 0) {
          // Full year data
          cashTotal.total = cashCard.yearlyTotal || 0;
          cashTotal.count = cashCard.yearlyCount || 0;
        } else {
          // Specific month data
          const monthData = cashCard.months.find(m => m.month === selectedMonth);
          if (monthData) {
            cashTotal.total = monthData.total || 0;
            cashTotal.count = monthData.count || 0;
          }
        }
      }

      return [cardTotal, cashTotal].filter(item => item.total > 0);
    }

    // Handle regular view
    if (monthlySpending.paymentMethodTotals && selectedMonth === 0) {
      // For "All Year" option, return paymentMethodTotals directly
      return monthlySpending.paymentMethodTotals;
    } else {
      // For specific month, calculate from card summaries
      const cashTotal = {
        _id: 'Cash',
        total: 0,
        count: 0
      };

      const cardTotal = {
        _id: 'Card',
        total: 0,
        count: 0
      };

      if (monthlySpending.cardSummaries) {
        monthlySpending.cardSummaries.forEach(card => {
          const monthData = card.months.find(m => m.month === selectedMonth);
          if (monthData) {
            if (card.cardId === 'cash') {
              cashTotal.total += monthData.total;
              cashTotal.count += monthData.count;
            } else {
              cardTotal.total += monthData.total;
              cardTotal.count += monthData.count;
            }
          }
        });
      }

      return [cardTotal, cashTotal].filter(item => item.total > 0);
    }
  };

  // Prepare data for the payment method chart
  const paymentMethodData = {
    labels: getPaymentMethodData().map(item => item._id),
    datasets: [
      {
        data: getPaymentMethodData().map(item => item.total),
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',
          'rgba(75, 192, 192, 0.8)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Category breakdown data
  const getCategoryData = () => {
    if (selectedMonth === 0) {
      // Return full year data
      return monthlySpending.categoryTotals;
    } else {
      // Calculate category totals for the selected month
      const categoryMap = new Map();

      monthlySpending.cardSummaries.forEach(card => {
        const monthData = card.months.find(m => m.month === selectedMonth);
        if (monthData && monthData.categories) {
          monthData.categories.forEach(cat => {
            const existing = categoryMap.get(cat.category) || { _id: cat.category, total: 0, count: 0 };
            categoryMap.set(cat.category, {
              _id: cat.category,
              total: existing.total + cat.total,
              count: existing.count + cat.count
            });
          });
        }
      });

      return Array.from(categoryMap.values());
    }
  };

  // Category breakdown data
  const categoryData = {
    labels: getCategoryData().map(item => item._id),
    datasets: [{
      label: 'Total Spending by Category',
      data: getCategoryData().map(item => Math.abs(item.total)),
      backgroundColor: getCategoryData().map((_, index) =>
        `hsla(${(index * 360) / getCategoryData().length}, 70%, 50%, 0.8)`
      ),
      borderWidth: 1,
    }]
  };

  // Subcategory breakdown data
  // For Monthly Expense view, only show Monthly Expense subcategories
  const getFilteredSubcategories = () => {
    if (selectedMonth === 0) {
      // Full year data
      const filteredCategories = isMonthlyExpenseView
        ? monthlySpending.subcategoryTotals.filter(category => category._id === "monthly-expense")
        : selectedCategory === 'all'
          ? monthlySpending.subcategoryTotals
          : monthlySpending.subcategoryTotals.filter(category => category._id === selectedCategory);

      return filteredCategories;
    } else {
      // Month-specific data
      const subcatMap = new Map();

      monthlySpending.cardSummaries.forEach(card => {
        const monthData = card.months.find(m => m.month === selectedMonth);
        if (monthData && monthData.categories) {
          // Filter categories based on view
          let relevantCategories = monthData.categories;
          if (isMonthlyExpenseView) {
            relevantCategories = monthData.categories.filter(c => c.category === "monthly-expense");
          } else if (selectedCategory !== 'all') {
            relevantCategories = monthData.categories.filter(c => c.category === selectedCategory);
          }

          // Process subcategories
          relevantCategories.forEach(cat => {
            if (cat.subcategories) {
              cat.subcategories.forEach(subcat => {
                if (!subcat.subcategory) return; // Skip empty subcategories

                const key = `${cat.category}-${subcat.subcategory}`;
                const existing = subcatMap.get(key) || {
                  category: cat.category,
                  subcategory: subcat.subcategory,
                  total: 0,
                  count: 0
                };

                subcatMap.set(key, {
                  category: cat.category,
                  subcategory: subcat.subcategory,
                  total: existing.total + subcat.total,
                  count: existing.count + subcat.count
                });
              });
            }
          });
        }
      });

      // Group by category to maintain the same structure as the year view
      const categoryGroups = new Map();

      Array.from(subcatMap.values()).forEach(item => {
        const category = item.category;
        if (!categoryGroups.has(category)) {
          categoryGroups.set(category, {
            _id: category,
            subcategories: []
          });
        }

        const group = categoryGroups.get(category);
        group.subcategories.push({
          subcategory: item.subcategory,
          total: item.total,
          count: item.count
        });
      });

      return Array.from(categoryGroups.values());
    }
  };

  const filteredSubcategories = getFilteredSubcategories();

  const subcategoryData = {
    labels: filteredSubcategories.flatMap(category =>
      category.subcategories
        .filter(sub => sub.subcategory) // Filter out empty subcategories
        .map(sub => sub.subcategory || 'General')
    ),
    datasets: [{
      label: 'Spending by Subcategory',
      data: filteredSubcategories.flatMap(category =>
        category.subcategories
          .filter(sub => sub.subcategory)
          .map(sub => Math.abs(sub.total))
      ),
      backgroundColor: filteredSubcategories.flatMap(category =>
        category.subcategories
          .filter(sub => sub.subcategory)
          .map((_, index) => `hsla(${Math.random() * 360}, 70%, 50%, 0.8)`)
      ),
      borderWidth: 1,
    }]
  };

  // Monthly spending by card data
  const monthlySpendingByCard = {
    labels: months,
    datasets: monthlySpending.cardSummaries.map(card => ({
      label: `${card.cardName} (*${card.lastFourDigits})`,
      data: card.months.map(month => month.total),
      backgroundColor: `hsla(${Math.random() * 360}, 70%, 50%, 0.8)`,
    }))
  };

  // Monthly spending total data
  const monthlySpendingTotal = {
    labels: months,
    datasets: [{
      label: 'Total Monthly Spending',
      data: monthlySpending.monthlyTotals.map(month => month.total),
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1,
      tension: 0.1
    }]
  };

  return (
    <div className={`charts-container ${theme}`}>
      <div className="charts-header">
        <h2>Transaction Analytics</h2>
        {error && <div className="error-message">{error}</div>}
        <div className="chart-selectors">
          <div className="chart-selector">
            <label>Year:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className={theme}
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

          <div className="chart-selector">
            <label>Month:</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className={theme}
            >
              <option value={0}>All Year</option>
              {months.map((month, index) => (
                <option key={month} value={index + 1}>
                  {month}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="chart-row">
        {!isMonthlyExpenseView && (
          <div className="chart-card">
            <h3>Spending by Category</h3>
            <div className="chart-wrapper">
              <Pie data={categoryData} options={chartOptions.pie} />
            </div>
          </div>
        )}

        {isMonthlyExpenseView && (
          <div className="chart-card">
            <h3>Spending by Payment Method</h3>
            <div className="chart-wrapper">
              <Pie data={paymentMethodData} options={chartOptions.pie} />
            </div>
          </div>
        )}

        <div className="chart-card">
          <h3>Spending by Subcategory</h3>
          {!isMonthlyExpenseView && (
            <div className="chart-selector">
              <label>Category:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={theme}
              >
                <option value="all">All Categories</option>
                {monthlySpending.categoryTotals.map(category => (
                  <option key={category._id} value={category._id}>
                    {category._id}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="chart-wrapper">
            <Pie
              data={subcategoryData}
              options={chartOptions.pie}
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
              ...chartOptions.bar,
              scales: {
                ...chartOptions.bar.scales,
                x: {
                  ...chartOptions.bar.scales.x,
                  stacked: true
                },
                y: {
                  ...chartOptions.bar.scales.y,
                  stacked: true
                }
              }
            }}
          />
        </div>
      </div>

      <div className="chart-card full-width">
        <h3>Monthly Spending Total</h3>
        <div className="chart-wrapper">
          <Line
            data={monthlySpendingTotal}
            options={chartOptions.line}
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
    maxAmount: PropTypes.number,
    paymentMethod: PropTypes.string
  })
};

TransactionCharts.defaultProps = {
  filters: {}
};

export default withErrorBoundary(TransactionCharts);