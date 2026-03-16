import style from "../../style.module.scss";
import type {IMailboxForm} from "../../api";

interface IModalFormProps {
	showModal: boolean;
	setShowModal: (show: boolean) => void;
	handleAddMailbox: (e: React.FormEvent) => Promise<void>;
	mailboxForm: IMailboxForm;
	setMailboxForm: (value: React.SetStateAction<IMailboxForm>) => void
}

const ModalForm = ({showModal, handleAddMailbox, mailboxForm, setMailboxForm, setShowModal}: IModalFormProps) => {

	if (!showModal) return null;

	return (
		<div className={style.modalOverlay}>
			<div className={style.modalContent}>
				<h3>Новый почтовый ящик</h3>
				<form onSubmit={handleAddMailbox}>
					<div className={style.formGroup}>
						<label>Email (отображение)</label>
						<input
							type="email"
							value={mailboxForm.email}
							onChange={(e) => setMailboxForm({...mailboxForm, email: e.target.value})}
							required
						/>
					</div>
					<div className={style.formGroup}>
						<label>IMAP Host</label>
						<div>
							<label>
								<input
									type='radio'
									value='imap.mail.ru'
									name='imapHost'
									checked={mailboxForm.host === 'imap.mail.ru'}
									onChange={(e) => setMailboxForm({...mailboxForm, host: e.target.value})}
									required
									style={{width:'18px'}}
								/>
								imap.mail.ru
							</label>
						</div>

						<div>
							<label>
								<input
									type='radio'
									value='imap.yandex.ru'
									name='imapHost'
									checked={mailboxForm.host === 'imap.yandex.ru'}
									onChange={(e) => setMailboxForm({...mailboxForm, host: e.target.value})}
									required
									style={{width:'18px'}}
								/>
								imap.yandex.ru
							</label>
						</div>
					</div>
					<div className={style.formGroup}>
						<label>Порт</label>
						<input
							type="number"
							value={mailboxForm.port}
							onChange={(e) => setMailboxForm({...mailboxForm, port: parseInt(e.target.value)})}
							required
						/>
					</div>
					<div className={style.formGroup}>
						<label>Логин</label>
						<input
							type="text"
							value={mailboxForm.login}
							onChange={(e) => setMailboxForm({...mailboxForm, login: e.target.value})}
							required
						/>
					</div>
					<div className={style.formGroup}>
						<label>Пароль приложения</label>
						<input
							type="password"
							value={mailboxForm.password}
							onChange={(e) => setMailboxForm({...mailboxForm, password: e.target.value})}
							required
						/>
					</div>
					<div className={style.formGroup}>
						<label>
							<input
								type="checkbox"
								checked={mailboxForm.secure}
								onChange={(e) => setMailboxForm({...mailboxForm, secure: e.target.checked})}
							/>
							Secure (SSL/TLS)
						</label>
					</div>
					<div className={style.formActions}>
						<button type="button" className={style.cancelBtn} onClick={() => setShowModal(false)}>Отмена</button>
						<button type="submit" className={style.submitBtn}>Добавить</button>
					</div>
				</form>
			</div>
		</div>
	)
}

export default ModalForm