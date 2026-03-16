import './App.css'
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import style from "./style.module.scss"
import {
  getEmails,
  getMailboxes,
  addMailbox,
  deleteMailbox,
  getMe,
  login,
  logout,
  emailsKeys,
  mailboxesKeys,
  type IMailboxForm,
  type IUser,
} from "./api";
import MailContainer from "./containers/MailContainer/MailContainer.tsx";
import ModalForm from "./containers/ModalForm/ModalForm.tsx";

const defaultMailboxForm: IMailboxForm = {
  email: '',
  host: '',
  port: 993,
  secure: true,
  login: '',
  password: '',
  active: true,
};

const App = () => {
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
      <div className={style.modalOverlay}>
        <div className={style.modalContent}>
          <h3>Вход</h3>
          <form onSubmit={handleLogin}>
            <div className={style.formGroup}>
              <label>Email</label>
              <input
                type="email"
                value={authForm.email}
                onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                required
              />
            </div>
            <div className={style.formGroup}>
              <label>Пароль</label>
              <input
                type="password"
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                required
              />
            </div>
            <div className={style.formActions}>
              <button type="submit" className={style.submitBtn}>
                Войти
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div>
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

      <ModalForm
        showModal={showModal}
        handleAddMailbox={handleAddMailbox}
        mailboxForm={mailboxForm}
        setMailboxForm={setMailboxForm}
        setShowModal={setShowModal}
      />
    </div>
  );
};

export default App
