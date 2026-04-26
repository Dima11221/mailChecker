import style from "../../style.module.scss";
import type {IUser} from "../../api";

interface IMailBoxHeadProps {
	handleLogout: () => void;
	setShowModal: (show: boolean) => void;
	user: IUser;
}

const MailBoxHead = ({handleLogout, setShowModal, user}: IMailBoxHeadProps) => {

	return (
		<div className={style.mailboxesSection}>
			<h2>Почтовые ящики</h2>
			<div>
				<span>{user.email}</span>
				<button type="button" onClick={handleLogout}>
					Выйти
				</button>
			</div>
			<button
				type="button"
				className={style.addBtn}
				onClick={() => setShowModal(true)}
			>
				Добавить почту для отслеживания
			</button>
		</div>
	)
}

export default MailBoxHead