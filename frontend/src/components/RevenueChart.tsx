import type { RevenueData } from "../types/dashboard";

interface RevenueChartProps {
  revenue: RevenueData;
}

const RevenueChart: React.FC<RevenueChartProps> = ({ revenue }) => {
  const maxAmount = Math.max(...revenue.monthlyData.map((d) => d.amount), 1);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Monthly Fee Collection
      </h3>

      <div className="flex items-end justify-between gap-3 h-40 mb-4">
        {revenue.monthlyData.map((item) => {
          const heightPercent = (item.amount / maxAmount) * 100;
          return (
            <div
              key={item.month}
              className="flex flex-col items-center gap-2 flex-1"
            >
              <span className="text-xs font-medium text-gray-700">
                Rs. {(item.amount / 1000).toFixed(0)}k
              </span>
              <div className="w-full bg-gray-200 rounded-t-md relative h-32">
                <div
                  className="absolute bottom-0 w-full bg-[#234A91] rounded-t-md transition-all duration-500 hover:bg-blue-600"
                  style={{ height: `${heightPercent}%` }}
                ></div>
              </div>
              <span className="text-xs text-gray-500">{item.month}</span>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Pending Collection</p>
          <p className="text-sm font-bold text-orange-600">
            Rs. {revenue.pendingCollection.toLocaleString("en-NP")}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Collected Amount</p>
          <p className="text-sm font-bold text-green-600">
            Rs. {revenue.collectedAmount.toLocaleString("en-NP")}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Monthly Target</p>
          <p className="text-sm font-bold text-[#234A91]">
            Rs. {revenue.monthlyFeeCollection.toLocaleString("en-NP")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RevenueChart;
