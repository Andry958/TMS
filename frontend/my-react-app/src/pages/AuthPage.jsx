import { useEffect, useState } from "react";
import { useAuth } from "../context/authStore";
import { useApi } from "../context/ApiContext";
import "../styles/auth.css";

const initialLogin = { email: "", password: "", rememberMe: false };
const initialRegister = { firstName: "", lastName: "", email: "", password: "", confirmPassword: "" };

function AuthPage() {
  const { login, register } = useAuth();
  const { apiData } = useApi();
  const [mode, setMode] = useState("login");
  const [loginForm, setLoginForm] = useState(initialLogin);
  const [registerForm, setRegisterForm] = useState(initialRegister);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has("authError")) {
      setError("Не вдалося увійти через Google. Спробуйте ще раз або скористайтеся email.");
      window.history.replaceState({}, "", `${window.location.pathname}${window.location.hash}`);
    }
  }, []);

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setError("");
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      if (mode === "login") await login(loginForm);
      else await register(registerForm);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLogin = mode === "login";
  const form = isLogin ? loginForm : registerForm;
  const update = (event) => {
    const { name, value, type, checked } = event.target;
    const updateForm = (current) => ({ ...current, [name]: type === "checkbox" ? checked : value });
    if (isLogin) setLoginForm(updateForm);
    else setRegisterForm(updateForm);
  };

  const signInWithGoogle = () => {
    const returnUrl = `${window.location.origin}${window.location.pathname}${window.location.search}${window.location.hash}`;
    window.location.assign(`${apiData}/auth/google?returnUrl=${encodeURIComponent(returnUrl)}`);
  };

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="auth-title">
        <div className="auth-brand">
          <img src="/logist-truck.png" alt="" />
          <span>EMAL Ltd.</span>
        </div>
        <div className="auth-heading">
          <p>LogiSystem</p>
          <h1 id="auth-title">{isLogin ? "Раді бачити знову" : "Створіть обліковий запис"}</h1>
          <span>{isLogin ? "Увійдіть, щоб продовжити роботу з перевезеннями." : "Почніть керувати логістикою в одному місці."}</span>
        </div>

        <div className="auth-tabs" role="tablist" aria-label="Авторизація">
          <button className={isLogin ? "is-active" : ""} type="button" onClick={() => switchMode("login")}>Вхід</button>
          <button className={!isLogin ? "is-active" : ""} type="button" onClick={() => switchMode("register")}>Реєстрація</button>
        </div>

        <form className="auth-form" onSubmit={submit}>
          {!isLogin && (
            <div className="auth-form__names">
              <label>Ім’я<input name="firstName" value={form.firstName} onChange={update} autoComplete="given-name" maxLength="100" /></label>
              <label>Прізвище<input name="lastName" value={form.lastName} onChange={update} autoComplete="family-name" maxLength="100" /></label>
            </div>
          )}
          <label>Email<input name="email" type="email" value={form.email} onChange={update} autoComplete="email" required /></label>
          <label>Пароль<input name="password" type="password" value={form.password} onChange={update} autoComplete={isLogin ? "current-password" : "new-password"} minLength="8" required /></label>
          {!isLogin && <label>Підтвердіть пароль<input name="confirmPassword" type="password" value={form.confirmPassword} onChange={update} autoComplete="new-password" minLength="8" required /></label>}
          {isLogin && <label className="auth-check"><input name="rememberMe" type="checkbox" checked={form.rememberMe} onChange={update} />Запам’ятати мене</label>}
          {!isLogin && <p className="auth-hint">Щонайменше 8 символів, велика та мала літера, цифра.</p>}
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="auth-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? "Зачекайте…" : isLogin ? "Увійти" : "Зареєструватися"}</button>
          <div className="auth-divider"><span>або</span></div>
          <button className="auth-google" type="button" onClick={signInWithGoogle}>
            <span className="auth-google__mark" aria-hidden="true">G</span>
            Продовжити з Google
          </button>
        </form>
      </section>
    </main>
  );
}

export default AuthPage;
