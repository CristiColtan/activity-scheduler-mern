import React from 'react'
import { useSelector } from 'react-redux'
import { Outlet, Navigate } from 'react-router-dom'

export default function PrivateRoute2() {
    const { currentUser } = useSelector((state) => state.user);
    const isAdmin = (currentUser.is_admin === "Yes" || currentUser.is_team_manager === "Yes");

    return isAdmin ? <Outlet /> : <Navigate to="/" />;
}
