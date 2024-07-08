import React from 'react'
import { useSelector, useDispatch } from 'react-redux';

const Profile = () => {
    const { currentUser } = useSelector((state) => state.user);
    console.log(currentUser)
  return (
      <div>
            <h1>Profilul Utilizatorului</h1>
            <pre>{JSON.stringify(currentUser, null, 2)}</pre>
        </div>
  )
}

export default Profile