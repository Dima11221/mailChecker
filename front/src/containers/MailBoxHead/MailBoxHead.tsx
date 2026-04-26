import style from "../../style.module.scss";

interface IMailBoxHeadProps {
	setShowModal: (show: boolean) => void;
}

const MailBoxHead = ({setShowModal}: IMailBoxHeadProps) => {

	return (
		<div className={style.mailboxesSection}>
			<h2>Почтовые ящики</h2>
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