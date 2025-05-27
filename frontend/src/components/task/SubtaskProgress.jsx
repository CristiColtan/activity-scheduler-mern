import React from "react";

const SubtaskProgress = ({ completed = 0, total = 0 }) => {
  const percent = total > 0 ? ((completed / total) * 100).toFixed(1) : 0;

  const progressColor =
    percent >= 80
      ? "bg-green-500"
      : percent >= 40
      ? "bg-yellow-400"
      : "bg-red-400";

  return (
    <div className="max-w-md px-5 py-2">
      <p className="text-normal font-serif  mb-1">
        Completed subtasks: ({percent}%)
      </p>

      <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${progressColor} transition-all duration-500`}
          style={{ width: `${percent}%` }}
        ></div>
      </div>

      <div className="flex justify-between font-thin mt-1">
        <span>
          {completed} / {total} subtasks
        </span>
        <span>{percent}%</span>
      </div>
    </div>
  );
};

export default SubtaskProgress;
