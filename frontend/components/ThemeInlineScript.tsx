const themeInit =
  '(function(){try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark"){document.documentElement.classList.toggle("dark",t==="dark")}else{document.documentElement.classList.toggle("dark",window.matchMedia("(prefers-color-scheme: dark)").matches)}}catch(e){}})();';

/** Inline head script — runs before paint to avoid theme flash. */
export default function ThemeInlineScript() {
  return <script dangerouslySetInnerHTML={{ __html: themeInit }} />;
}
