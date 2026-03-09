import './App.css'
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import style from "./style.module.scss"

const API = 'http://localhost:5001';

interface IEmails {
  id: string
  mailbox_email: string;
  source: string;
  subject: string;
  body: string;
  folder: string;
  received_at: string;
}

interface IMailbox {
  id: number;
  email: string;
}

const App = () => {
  const queryClient = useQueryClient();
  const { data: emails = [] } = useQuery({
    queryKey: ['emails'],
    queryFn: async () => {
      const { data } = await axios.get<IEmails[]>(`${API}/emails`);
      return data;
    },
  });
  const { data: mailboxes = [] } = useQuery({
    queryKey: ['mailboxes'],
    queryFn: async () => {
      const { data } = await axios.get<IMailbox[]>(`${API}/mailboxes`);
      return data;
    },
  });

  const [openEmailIds, setOpenEmailIds] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [mailboxForm, setMailboxForm] = useState({
    user_id: 1, // Временная заглушка
    email: '',
    host: '',
    port: 993,
    secure: true,
    login: '',
    password: '',
    active: true
  });

  const toggleOpen = (id: string) => {
    setOpenEmailIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }

  const handleDeleteMailbox = async (id: number) => {
    if (!confirm('Удалить этот почтовый ящик? Письма из него тоже удалятся.')) return;
    try {
      await axios.delete(`${API}/mailboxes/${id}`);
      await queryClient.invalidateQueries({ queryKey: ['mailboxes'] });
      await queryClient.invalidateQueries({ queryKey: ['emails'] });
    } catch (error) {
      console.error('Error deleting mailbox', error);
      alert('Ошибка при удалении');
    }
  }

  const handleAddMailbox = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/mailboxes`, mailboxForm);
      setShowModal(false);
      setMailboxForm({
        user_id: 1,
        email: '',
        host: '',
        port: 993,
        secure: true,
        login: '',
        password: '',
        active: true
      });
      alert('Почта успешно добавлена!');
      await queryClient.invalidateQueries({ queryKey: ['mailboxes'] });
    } catch (error) {
      console.error('Error adding mailbox', error);
      alert('Ошибка при добавлении почты');
    }
  }

  return (
    <div>
      <div className={style.mailboxesSection}>
        <h2>Почтовые ящики</h2>
        <button
          type="button"
          className={style.addBtn}
          onClick={() => setShowModal(true)}
        >
          Добавить почту для отслеживания
        </button>
        {mailboxes.length > 0 && (
          <ul className={style.mailboxList}>
            {mailboxes.map((mb) => (
              <li key={mb.id} className={style.mailboxItem}>
                <span>{mb.email}</span>
                <button
                  type="button"
                  className={style.deleteBtn}
                  onClick={() => handleDeleteMailbox(mb.id)}
                >
                  Удалить
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {showModal && (
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
                <input 
                  type="text" 
                  value={mailboxForm.host}
                  onChange={(e) => setMailboxForm({...mailboxForm, host: e.target.value})}
                  placeholder="imap.mail.ru или imap.yandex.ru"
                  required 
                />
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
      )}
      <h2>Письма</h2>
      <div className={style.tableContainer}>
        <table border={1} cellPadding={20} className={style.mailTable}>
        <thead>
          <tr>
            <th className={style.colNarrow}>Почта</th>
            <th className={style.colNarrow}>Источник</th>
            <th>Тема</th>
            <th className={style.colNarrow}>Папка</th>
            <th className={style.colDate}>Дата</th>
            <th className={style.colContent}>Содержимое</th>
          </tr>
        </thead>
        <tbody>
        {emails && emails.length > 0 && emails.map((email: IEmails) => (
          <tr key={email.id}>
            <td>{email.mailbox_email}</td>
            <td>{email.source}</td>
            <td>{email.subject}</td>
            <td>{email.folder}</td>
            <td>{new Date(email.received_at).toLocaleString()}</td>
            <td>
              <button
                type="button"
                onClick={() => toggleOpen(email.id)}
              >
                {openEmailIds.includes(email.id) ? ('Закрыть') : ('Подробнее')}
              </button>
              {openEmailIds.includes(email.id) ? (
                <div className={style.mailBody}>{email.body}</div>
              ) : null}
            </td>
          </tr>

        ))}
        </tbody>
      </table>
      </div>
    </div>
  )
}

export default App
