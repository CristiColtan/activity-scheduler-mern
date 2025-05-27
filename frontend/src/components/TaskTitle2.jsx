import React from "react";
import clsx from "clsx";

const TaskTitle2 = ({ label, classes }) => {
  return (
    <div className="w-full h-10 md:h-10 px-2 md:px-4 rounded bg-white items-center justify-center flex font-serif">
      <div className="flex gap-2 items-center whitespace-nowrap">
        <div className={clsx("w-4 h-4 rounded-full", classes)}></div>
        <p>{label}</p>
      </div>
    </div>
  );
};

export default TaskTitle2;
