import React from 'react'
import clsx from "clsx"

const PageTitle = ({ title, classes }) => {
  return (
    <h2 className={clsx("text-2xl font-serif capitalize", classes)}>
      {title}
    </h2>
  )
}

export default PageTitle