import {Link, useLocation} from "react-router-dom";
import style from "./style.module.scss"
import {useAuth} from "../../auth/useAuth.ts";

const Header = () => {
	const { signOut, user } = useAuth();
	const {pathname} = useLocation();

	const handleLogout = () => {
		signOut();
	};

	return (
		<div>
			<h1>Страницы</h1>
			<ul className={style.main}>
				<li>
					<Link to="/" className={pathname === '/' ? style.active : style.mainPage}>Главная</Link>
				</li>
				<li>
					<Link to="/razmeshenie" className={pathname === '/razmeshenie' ? style.active : style.mainPage}>Размещение</Link>
				</li>
				<li>
					<Link to="/sozdanie" className={pathname === '/sozdanie' ? style.active : style.mainPage}>Создание</Link>
				</li>
			</ul>
			<div>
				<span>{user?.email}</span>
				<button type="button" onClick={handleLogout}>
					Выйти
				</button>
			</div>
		</div>
	)
}

export default Header;