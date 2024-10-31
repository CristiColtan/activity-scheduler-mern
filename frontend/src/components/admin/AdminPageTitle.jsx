import React from 'react'
import clsx from "clsx"

const AdminPageTitle = ({ title, classes }) => {
  return (
    <h2 className={clsx("text-xl font-serif capitalize", classes)}>
      {title}
    </h2>
  )
}

export default AdminPageTitle