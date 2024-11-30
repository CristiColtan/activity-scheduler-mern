import { task_type } from "../../utils/tableImports.js";

const CustomToolTipReport2 = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-600 text-white p-2 rounded shadow-md">
        <div className="flex items-center gap-2">
          <p className="font-semibold">{payload[0]?.name}</p>
        </div>
        <p className="text-center">{`Total hours: ${payload[0]?.value}`}</p>
      </div>
    );
  }

  return null;
};

export default CustomToolTipReport2;
