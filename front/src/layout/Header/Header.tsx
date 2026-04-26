import {Link} from "react-router-dom";
import style from "./style.module.scss"
import {useAuth} from "../../auth/useAuth.ts";

const Header = () => {
	const { signOut, user } = useAuth();

	const handleLogout = () => {
		signOut();
	};

	return (
		<div>
			<h1>Страницы</h1>
			<ul className={style.main}>
				<li>
					<Link to="/">Главная</Link>
				</li>
				<li>
					<Link to="/razmeshenie">Размещение</Link>
				</li>
				<li>
					<Link to="/sozdanie">Создание</Link>
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