import { task_type } from "../../utils/tableImports.js";

const CustomToolTipReport1 = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const task = payload[0]?.payload?.task; //task-ul corespunzator din filteredTasks (legenda)
    const stageClass = task_type[task.stage];

    return (
      <div className="bg-gray-600 text-white p-2 rounded shadow-md">
        <div className="flex items-center gap-2">
          <div className={`w-4 h-4 rounded-full ${stageClass}`} />
          <p className="font-semibold">{payload[0]?.name}</p>
        </div>
        <p className="text-center">{`Total hours: ${payload[0]?.value}`}</p>
      </div>
    );
  }

  return null;
};

export default CustomToolTipReport1;
