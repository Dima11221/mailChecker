import React, { createContext, useEffect, useMemo, useState } from "react";
import { getMe, login as apiLogin, logout as apiLogout, type IUser } from "../api";

type LoginPayload = { email: string; password: string };

type AuthContextValue = {
	user: IUser | null;
	loading: boolean;
	signIn: (payload: LoginPayload) => Promise<void>;
	signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);
export { AuthContext };

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const [user, setUser] = useState<IUser | null>(null);
	const [loading, setLoading] = useState(true);

	// 1) Автовосстановление сессии при старте приложения
	useEffect(() => {
		getMe()
			.then(({ user }) => setUser(user))
			.catch(() => {setUser(null);})
			.finally(() => queueMicrotask(() => setLoading(false)));
	}, []);

	// 2) Логин: сохраняем token (apiLogin уже делает это), затем берём /auth/me
	const signIn = async (payload: LoginPayload) => {
		await apiLogin(payload);
		const me = await getMe();
		setUser(me.user);
	};

	// 3) Логаут: чистим token и user
	const signOut = () => {
		apiLogout();
		setUser(null);
	};

	const value = useMemo(
		() => ({ user, loading, signIn, signOut }),
		[user, loading]
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;