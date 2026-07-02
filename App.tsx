import { useEffect, useRef } from "react";
import "./App.css";
// @ts-ignore
import { PHONE_HTML } from "./markup.js";
// @ts-ignore
import { mount } from "./app-runtime.js";

function App() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || el.dataset.mounted) return;
    el.dataset.mounted = "1";
    el.innerHTML = PHONE_HTML;
    mount();
  }, []);
  return <div ref={ref} className="ait-root" />;
}

export default App;
