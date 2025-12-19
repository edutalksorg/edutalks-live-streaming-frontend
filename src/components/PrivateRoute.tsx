import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

interface PrivateRouteProps {
    allowedRoles: string[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ allowedRoles }) => {
    const auth = useContext(AuthContext);

    if (auth?.loading) {
        return <div>Loading...</div>;
    }

    if (!auth?.user) {
        return <Navigate to="/login" replace />;
    }

    // Role mapping if needed (backend sends role_name as 'super_admin', etc.)
    if (!allowedRoles.includes(auth.user.role)) {
        // Optionally redirect to their actual dashboard or unauthorized page
        return <div className="p-4 text-red-500">Unauthorized Access</div>;
    }

    return <Outlet />;
};

export default PrivateRoute;
