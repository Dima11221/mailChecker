import {Link} from "react-router-dom";
import style from "./style.module.scss"

const Header = () => {
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
		</div>
	)
}

export default Header;