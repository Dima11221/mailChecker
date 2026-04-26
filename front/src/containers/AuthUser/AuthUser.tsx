import style from "../../style.module.scss";
import * as React from "react";

interface IAuthUser {
	handleLogin: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
	authForm: {email: string,password: string };
	setAuthForm: React.Dispatch<React.SetStateAction<{
		email: string
		password: string
	}>>;
}

const AuthUser = ({handleLogin, authForm, setAuthForm}: IAuthUser) => {
	return (
		<div className={style.modalOverlay}>
			<div className={style.modalContent}>
				<h3>Вход</h3>
				<form onSubmit={handleLogin}>
					<div className={style.formGroup}>
						<label>Email</label>
						<input
							type="email"
							value={authForm.email}
							onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
							required
						/>
					</div>
					<div className={style.formGroup}>
						<label>Пароль</label>
						<input
							type="password"
							value={authForm.password}
							onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
							required
						/>
					</div>
					<div className={style.formActions}>
						<button type="submit" className={style.submitBtn}>
							Войти
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}

export default AuthUser;