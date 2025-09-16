
import ResumeGenerator from './components/latexlive';

export default function Latex() {
  return (
    <main style={{ padding: 20 }}>
      <h1>LaTeX Live Editor</h1>
      <ResumeGenerator/>
    </main>
  );
}