import style from "../../style.module.scss";
import MailContainer from "../MailContainer/MailContainer.tsx";
import type {IEmails, IMailbox} from "../../api";

interface IMailBoxInfoProps {
	toggleOpen: (id: number) => void;
	openEmailIds: number[];
	emailsByMailboxSorted:  {
		mailbox: IMailbox
		emails: IEmails[]
	}[];
	handleDeleteMailbox: (id: number) => void;
}

const MailBoxInfo = ({toggleOpen, openEmailIds, emailsByMailboxSorted, handleDeleteMailbox}: IMailBoxInfoProps) => {

	return (
		<div>
			{emailsByMailboxSorted.map(({ mailbox: mb, emails: mailboxEmails }) => (
				<div key={mb.id} className={style.mailboxBlock}>
					<div className={style.mailboxHeader}>
						<h3>{mb.email}</h3>
						<button
							type="button"
							className={style.deleteBtn}
							onClick={() => handleDeleteMailbox(mb.id)}
						>
							Удалить ящик
						</button>
					</div>
					{(mb.last_error ||
						mb.last_checked_at ||
						(mb.consecutive_failures && mb.consecutive_failures > 0)) && (
						<div className={style.mailboxStatus}>
							{mb.last_error ? (
								<div className={style.mailboxError}>
									<strong>Ошибка IMAP:</strong> {mb.last_error}
									{mb.consecutive_failures > 0 && (
										<span className={style.mailboxFailures}>
                      {' '}
											(подряд неудач: {mb.consecutive_failures})
                    </span>
									)}
								</div>
							) : mb.last_success_at ? (
								<div className={style.mailboxOk}>
									Последняя успешная проверка:{' '}
									{new Date(mb.last_success_at).toLocaleString()}
								</div>
							) : null}
							{mb.last_checked_at && !mb.last_error && !mb.last_success_at && (
								<div className={style.mailboxMuted}>
									Проверялось: {new Date(mb.last_checked_at).toLocaleString()}
								</div>
							)}
						</div>
					)}

					<MailContainer
						mailboxEmails={mailboxEmails}
						toggleOpen={toggleOpen}
						openEmailIds={openEmailIds}
					/>
				</div>
			))}
		</div>
	)
}

export default MailBoxInfo;