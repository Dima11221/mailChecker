import MailBoxHead from "../../containers/MailBoxHead/MailBoxHead.tsx";
import MailBoxInfo from "../../containers/MailBoxInfo/MailBoxInfo.tsx";
import ModalForm from "../../containers/ModalForm/ModalForm.tsx";
import * as React from "react";
import {
	addMailbox,
	deleteMailbox,
	emailsKeys,
	getEmails,
	getMailboxes, getMe, type IMailboxForm,
	type IUser, login,
	logout,
	mailboxesKeys
} from "../../api";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import {useEffect, useState} from "react";
import AuthUser from "../../containers/AuthUser/AuthUser.tsx";



const defaultMailboxForm: IMailboxForm = {
	email: '',
	host: '',
	port: 993,
	secure: true,
	login: '',
	password: '',
	active: true,
};

const Razmeshenie = () => {

	const queryClient = useQueryClient();
	const [user, setUser] = useState<IUser | null>(null);
	const [authForm, setAuthForm] = useState({ email: "", password: "" });
	const [authLoading, setAuthLoading] = useState(true);
	const { data: emails = [] } = useQuery({
		queryKey: emailsKeys.all,
		queryFn: getEmails,
		enabled: !!user,
		refetchInterval: 30_000,
	});
	const { data: mailboxes = [] } = useQuery({
		queryKey: mailboxesKeys.all,
		queryFn: getMailboxes,
		enabled: !!user,
		refetchInterval: 30_000,
	});

	const [openEmailIds, setOpenEmailIds] = useState<number[]>([]);
	const [showModal, setShowModal] = useState(false);
	const [mailboxForm, setMailboxForm] = useState<IMailboxForm>(defaultMailboxForm);

	useEffect(() => {
		const token = localStorage.getItem("token");

		if (!token) {
			queueMicrotask(() => setAuthLoading(false));
			return;
		}

		getMe()
			.then(({ user: currentUser }) => {
				setUser(currentUser);
			})
			.catch(() => {
				localStorage.removeItem("token");
				setUser(null);
			})
			.finally(() => {
				setAuthLoading(false);
			});
	}, []);

	const toggleOpen = (id: number) => {
		setOpenEmailIds((prev) =>
			prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
		);
	};

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			const response = await login(authForm);
			setUser(response.user);
		} catch (error) {
			console.error('Login error', error);
			alert('Ошибка авторизации');
		}
	};

	const handleLogout = () => {
		logout();
		queryClient.clear();
		setUser(null);
	};

	const handleDeleteMailbox = async (id: number) => {
		if (!confirm('Удалить этот почтовый ящик? Письма из него тоже удалятся.')) return;
		try {
			await deleteMailbox(id);
			await queryClient.invalidateQueries({ queryKey: mailboxesKeys.all });
			await queryClient.invalidateQueries({ queryKey: emailsKeys.all });
		} catch (error) {
			console.error('Error deleting mailbox', error);
			alert('Ошибка при удалении');
		}
	};

	const handleAddMailbox = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			await addMailbox(mailboxForm);
			setShowModal(false);
			setMailboxForm(defaultMailboxForm);
			alert(
				'Ящик добавлен. Проверка IMAP идёт в фоне: если host/логин/пароль неверны — ниже появится красное сообщение об ошибке (обновление каждые ~30 сек).'
			);
			await queryClient.invalidateQueries({ queryKey: mailboxesKeys.all });
		} catch (error: unknown) {
			console.error('Error adding mailbox', error);
			const msg =
				error &&
				typeof error === 'object' &&
				'response' in error &&
				error.response &&
				typeof error.response === 'object' &&
				'data' in error.response &&
				error.response.data &&
				typeof error.response.data === 'object' &&
				'error' in error.response.data
					? String((error.response.data as { error: string }).error)
					: 'Ошибка при добавлении почты';
			alert(msg);
		}
	};

	const emailsByMailbox = mailboxes.map((mb) => ({
		mailbox: mb,
		emails: emails.filter((e) => e.mailbox_email === mb.email),
	}));

	const emailsByMailboxSorted = [...emailsByMailbox].sort((a, b) => {
		const lastA = a.emails.length
			? Math.max(...a.emails.map((e) => new Date(e.received_at).getTime())) : 0;

		const lastB = b.emails.length
			? Math.max(...b.emails.map((e) => new Date(e.received_at).getTime())) : 0;

		return lastB - lastA;
	})

	if (authLoading) {
		return <div>Загрузка...</div>;
	}

	if (!user) {
		return (
			<div>
				<AuthUser
					handleLogin={handleLogin}
					authForm={authForm}
					setAuthForm={setAuthForm}
				/>
			</div>
		);
	}

	return (
		<div>
			<MailBoxHead
				handleLogout={handleLogout}
				setShowModal={setShowModal}
				user={user}
			/>

			<MailBoxInfo
				toggleOpen={toggleOpen}
				openEmailIds={openEmailIds}
				emailsByMailboxSorted={emailsByMailboxSorted}
				handleDeleteMailbox={handleDeleteMailbox}
			/>

			<ModalForm
				showModal={showModal}
				handleAddMailbox={handleAddMailbox}
				mailboxForm={mailboxForm}
				setMailboxForm={setMailboxForm}
				setShowModal={setShowModal}
			/>
		</div>
	)
}

export default Razmeshenie