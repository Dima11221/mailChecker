import style from "../../style.module.scss";
import type {IEmails} from "../../api";

interface IMailContainerProps {
	mailboxEmails: IEmails[];
	toggleOpen: (id: number) => void;
	openEmailIds: number[];
}

const MailContainer = ({mailboxEmails, toggleOpen, openEmailIds}: IMailContainerProps) => {

	return (
		<div className={style.tableContainer}>
			<table border={1} cellPadding={20} className={style.mailTable}>
				<thead>
				<tr>
					<th className={style.colNarrow}>Источник</th>
					<th>Тема</th>
					<th className={style.colNarrow}>Папка</th>
					<th className={style.colDate}>Дата</th>
					<th className={style.colContent}>Содержимое</th>
				</tr>
				</thead>
				<tbody>
				{mailboxEmails.length === 0 ? (
					<tr>
						<td colSpan={5}>Нет писем</td>
					</tr>
				) : (
					mailboxEmails.map((email) => (
						<tr key={email.id}>
							<td>{email.source}</td>
							<td>{email.subject}</td>
							<td>{email.folder}</td>
							<td>{new Date(email.received_at).toLocaleString()}</td>
							<td>
								<button
									type="button"
									onClick={() => toggleOpen(email.id)}
								>
									{openEmailIds.includes(email.id) ? 'Закрыть' : 'Подробнее'}
								</button>
								{openEmailIds.includes(email.id) ? (
									<div className={style.mailBody}>{email.body}</div>
								) : null}
							</td>
						</tr>
					))
				)}
				</tbody>
			</table>
		</div>
	)
}

export default MailContainer;