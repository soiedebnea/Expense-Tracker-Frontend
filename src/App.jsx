import { useCallback, useEffect, useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, Legend } from 'recharts';
import { api } from './api';

const CURRENCY = '৳';
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const money = (n) => `${CURRENCY}${Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
const today = () => new Date().toISOString().slice(0, 10);

export default function App() {
  const [month, setMonth] = useState(today().slice(0, 7));
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [report, setReport] = useState({ income: 0, expense: 0, balance: 0, byCategory: [] });
  const [yearly, setYearly] = useState([]);
  const [error, setError] = useState('');

  const [tx, setTx] = useState({ type: 'expense', amount: '', category: '', date: today(), note: '' });
  const [cat, setCat] = useState({ name: '', type: 'expense', color: '#2B6E8F' });

  const year = month.slice(0, 4);

  const load = useCallback(async () => {
    try {
      const [c, t, r, y] = await Promise.all([
        api.categories(), api.transactions(month), api.monthly(month), api.yearly(year),
      ]);
      setCategories(c); setTransactions(t); setReport(r);
      setYearly(y.map((m) => ({ ...m, name: MONTHS[m.month - 1] })));
      setError('');
    } catch (e) { setError(e.message); }
  }, [month, year]);

  useEffect(() => { load(); }, [load]);

  const run = async (fn) => {
    try { await fn(); await load(); } catch (e) { setError(e.message); }
  };

  const typeCats = categories.filter((c) => c.type === tx.type);
  const expenseSlices = report.byCategory.filter((c) => c.type === 'expense');

  const submitTx = (e) => {
    e.preventDefault();
    run(async () => {
      await api.addTransaction({ ...tx, amount: Number(tx.amount), category: tx.category || typeCats[0]?._id });
      setTx({ ...tx, amount: '', note: '' });
    });
  };

  const submitCat = (e) => {
    e.preventDefault();
    run(async () => { await api.addCategory(cat); setCat({ ...cat, name: '' }); });
  };

  return (
    <div className="app">
      <header>
        <h1>Expense Tracker</h1>
        <input type="month" value={month} onChange={(e) => e.target.value && setMonth(e.target.value)} aria-label="Month" />
      </header>

      {error && <p className="error" role="alert">{error}</p>}

      <section className="totals">
        <div><span>Income</span><b className="inc">{money(report.income)}</b></div>
        <div><span>Expenses</span><b className="exp">{money(report.expense)}</b></div>
        <div><span>Balance</span><b className={report.balance < 0 ? 'exp' : ''}>{money(report.balance)}</b></div>
      </section>

      <main>
        <div className="col">
          <form onSubmit={submitTx} className="panel">
            <h2>Add transaction</h2>
            <div className="seg">
              {['expense', 'income'].map((t) => (
                <button type="button" key={t} className={tx.type === t ? `on ${t}` : ''}
                  onClick={() => setTx({ ...tx, type: t, category: '' })}>{t === 'expense' ? 'Expense' : 'Income'}</button>
              ))}
            </div>
            <label>Amount<input type="number" step="0.01" min="0.01" required value={tx.amount}
              onChange={(e) => setTx({ ...tx, amount: e.target.value })} /></label>
            <label>Category
              <select value={tx.category || typeCats[0]?._id || ''} onChange={(e) => setTx({ ...tx, category: e.target.value })} required>
                {typeCats.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </label>
            <label>Date<input type="date" required value={tx.date} onChange={(e) => setTx({ ...tx, date: e.target.value })} /></label>
            <label>Note<input maxLength={200} value={tx.note} onChange={(e) => setTx({ ...tx, note: e.target.value })} /></label>
            <button className="primary">Save transaction</button>
          </form>

          <form onSubmit={submitCat} className="panel">
            <h2>Categories</h2>
            <div className="row">
              <input placeholder="New category" required maxLength={40} value={cat.name} onChange={(e) => setCat({ ...cat, name: e.target.value })} />
              <select value={cat.type} onChange={(e) => setCat({ ...cat, type: e.target.value })}>
                <option value="expense">Expense</option><option value="income">Income</option>
              </select>
              <input type="color" value={cat.color} onChange={(e) => setCat({ ...cat, color: e.target.value })} aria-label="Color" />
            </div>
            <button className="primary">Add category</button>
            <ul className="cats">
              {categories.map((c) => (
                <li key={c._id}>
                  <i style={{ background: c.color }} /> {c.name} <small>{c.type}</small>
                  <button type="button" className="link" onClick={() => run(() => api.deleteCategory(c._id))}>Delete</button>
                </li>
              ))}
            </ul>
          </form>
        </div>

        <div className="col wide">
          <div className="panel">
            <h2>Expenses by category</h2>
            {expenseSlices.length === 0 ? <p className="empty">No expenses this month. Add one to see the breakdown.</p> : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={expenseSlices} dataKey="total" nameKey="name" innerRadius={55} outerRadius={95}>
                    {expenseSlices.map((s) => <Cell key={s.name} fill={s.color} />)}
                  </Pie>
                  <Tooltip formatter={money} /><Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="panel">
            <h2>{year} month by month</h2>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={yearly}>
                <XAxis dataKey="name" /><YAxis width={50} /><Tooltip formatter={money} /><Legend />
                <Bar dataKey="income" name="Income" fill="#1F7A5A" />
                <Bar dataKey="expense" name="Expenses" fill="#C2493D" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="panel">
            <h2>Transactions</h2>
            {transactions.length === 0 ? <p className="empty">Nothing recorded for this month yet.</p> : (
              <ul className="list">
                {transactions.map((t) => (
                  <li key={t._id}>
                    <i style={{ background: t.category?.color }} />
                    <div><b>{t.category?.name}</b><small>{t.date.slice(0, 10)}{t.note && ` · ${t.note}`}</small></div>
                    <span className={t.type === 'income' ? 'inc' : 'exp'}>{t.type === 'income' ? '+' : '−'}{money(t.amount)}</span>
                    <button className="link" onClick={() => run(() => api.deleteTransaction(t._id))}>Delete</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}