import {useAuth} from "./useAuth.ts";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const ProtectedRoute = () => {
	const { user, loading } = useAuth();
	const location = useLocation();

	if (loading) return <div>Загрузка...</div>;

	if (!user) {
		return <Navigate to="/login" replace state={{ from: location }} />;
	}

	return <Outlet />
}

export default ProtectedRoute;