import React, {useState, Fragment} from 'react'
import { useSelector } from 'react-redux';
import TeamAdmin from '../components/TeamAdmin';
import TeamManager from '../components/TeamManager';

//normal user  -> nu are access
//team manager -> vede echipa sa + add new team member button
//admin        -> vede team managerii + add new team manager button

const Team = () => {
    const { currentUser, loading, error } = useSelector((state) => state.user);

    return (
        <>
            {currentUser.is_team_manager === "Yes" && <div>
                <TeamManager />
            </div>}
            {currentUser.is_admin === "Yes" && <div>
                <TeamAdmin />
            </div>}
        </>
    )
}

export default Team