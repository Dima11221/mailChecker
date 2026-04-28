import style from "../../style.module.scss";
import MailContainer from "../MailContainer/MailContainer.tsx";
import {type IEmails, type IMailbox, mailboxesKeys} from "../../api";
import {useState} from "react";
import {updateMailboxClients} from "../../api/mailboxes.ts";
import {useQueryClient} from "@tanstack/react-query";

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
	const [editingMailBoxId, setEditingMailBoxId] = useState<number | null>(null);
	const [clientsDraft, setClientsDraft] = useState<string>('');
	const [saving, setSaving] = useState<boolean>(false);

	const queryClient = useQueryClient();

	const handleStartEditingClients = (mb: IMailbox) => {
		setEditingMailBoxId(mb.id);
		setClientsDraft((mb.clients ?? []).join(','));
	};

	const handleEndEditingClients = () => {
		setEditingMailBoxId(null);
		setClientsDraft('');
	};

	const parseClientsDraft = (draft: string) => {
		const items = draft.split(',').map((item) => item.trim()).filter(Boolean);
		console.log("items", items);
		return Array.from(new Set(items));
	};

	const handleSaveClients = async (mailboxId: number) => {
		const clients = parseClientsDraft(clientsDraft);

		try {
			setSaving(true);
			await updateMailboxClients(mailboxId, clients);
			await queryClient.invalidateQueries({ queryKey: mailboxesKeys.all });
			handleEndEditingClients();
		} catch (e) {
			console.log(e);
		} finally {
			setSaving(false);
		}
	}

	return (
		<div>
			{emailsByMailboxSorted.map(({ mailbox: mb, emails: mailboxEmails }) => (
				<div key={mb.id} className={style.mailboxBlock}>
					<div className={style.mailboxHeader}>
						<div
							className={style.flexGap}
						>
							<h3>{mb.email}</h3>

							{editingMailBoxId === mb.id ? (
								<>
									<input
										value={clientsDraft}
										onChange={e => setClientsDraft(e.currentTarget.value)}
										placeholder="Клиенты через запятую"
										disabled={saving}
										style={{ minWidth: 320 }}
									/>
									<button
										type="button"
										onClick={() => handleSaveClients(mb.id)}
										disabled={saving}
									>
										Сохранить
									</button>
									<button
										type="button"
										onClick={handleEndEditingClients}
										disabled={saving}
									>
										Отмена
									</button>
								</>
							) : (
								<button
									type="button"
									onClick={() => handleStartEditingClients(mb)}
								>
									Клиенты: {mb.clients.length ? mb.clients.join(",") : 'Пока нет клиентов'}
								</button>
							)}

						</div>
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