import React from 'react'
import { useSelector } from 'react-redux';

import TrashManager from '../components/TrashManager.jsx';
import TrashAdmin from '../components/TrashAdmin.jsx';

const Trash = () => {
  const { currentUser, loading, error } = useSelector((state) => state.user);
  
  return (
    <>
      {currentUser.is_team_manager === "Yes" && <div>
        <TrashManager/>
      </div>}
      {currentUser.is_admin === "Yes" && <div>
        <TrashAdmin/>
      </div> }
    </>

  )
}

export default Trash