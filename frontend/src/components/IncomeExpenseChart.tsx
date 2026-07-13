import type { RevenueData } from "../types/dashboard";

interface IncomeExpenseChartProps {
  revenue: RevenueData;
}

const IncomeExpenseChart: React.FC<IncomeExpenseChartProps> = ({ revenue }) => {
  const maxAmount = Math.max(
    ...revenue.monthlyData.map((item) => item.amount),
    1
  );

  const expenseFactor = 0.65;
  const expenseData = revenue.monthlyData.map((item) => ({
    month: item.month,
    income: item.amount,
    expense: Math.round(item.amount * expenseFactor),
  }));

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Income vs Expense
      </h3>

      <div className="flex items-center gap-6 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#234A91]"></div>
          <span className="text-sm text-gray-600">Income</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-teal-500"></div>
          <span className="text-sm text-gray-600">Expense</span>
        </div>
      </div>

      <div className="flex items-end justify-between gap-3 h-40">
        {expenseData.map((item) => {
          const incomeHeight = (item.income / maxAmount) * 100;
          const expenseHeight = (item.expense / maxAmount) * 100;
          return (
            <div
              key={item.month}
              className="flex flex-col items-center gap-1 flex-1"
            >
              <span className="text-xs text-gray-500 mb-1">
                Rs. {(item.income / 1000).toFixed(0)}k
              </span>
              <div className="w-full flex gap-0.5 h-32">
                <div className="flex-1 bg-gray-200 rounded-t-md relative">
                  <div
                    className="absolute bottom-0 w-full bg-[#234A91] rounded-t-md transition-all duration-500"
                    style={{ height: `${incomeHeight}%` }}
                  ></div>
                </div>
                <div className="flex-1 bg-gray-200 rounded-t-md relative">
                  <div
                    className="absolute bottom-0 w-full bg-teal-500 rounded-t-md transition-all duration-500"
                    style={{ height: `${expenseHeight}%` }}
                  ></div>
                </div>
              </div>
              <span className="text-xs text-gray-500">{item.month}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Total Income</p>
          <p className="text-sm font-bold text-[#234A91]">
            Rs.{" "}
            {expenseData
              .reduce((sum, current) => sum + current.income, 0)
              .toLocaleString("en-NP")}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Total Expense</p>
          <p className="text-sm font-bold text-teal-600">
            Rs.{" "}
            {expenseData
              .reduce((sum, current) => sum + current.expense, 0)
              .toLocaleString("en-NP")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default IncomeExpenseChart;
