import {useAuth} from "../../auth/useAuth.ts";
import {useState} from "react";
import {useLocation, useNavigate, Navigate, type Location} from "react-router-dom";
import AuthUser from "../../containers/AuthUser/AuthUser.tsx";

type LocationState = { from?: Location };

const LoginPage = () => {
	const { user, signIn } = useAuth();
	const [authForm, setAuthForm] = useState({ email: "", password: "" });

	const navigate = useNavigate();
	const location = useLocation();

	const from = (location.state as LocationState | null)?.from?.pathname ?? "/";

	if (user) return <Navigate to={from} replace/>;

	const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		try {
			await signIn(authForm);
			navigate(from, {replace: true});
		} catch (error) {
			console.error(error);
			alert("Ошибка авторизации");
		}
	};

	return <AuthUser
		handleLogin={handleLogin}
		authForm={authForm}
		setAuthForm={setAuthForm}
	/>
}

export default LoginPage;