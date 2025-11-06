// front/src/app/truco/page.js
import TrucoGame from '@/components/TrucoGame';

export default function TrucoPage() {
  return (
    <main style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
      padding: '20px'
    }}>
      <TrucoGame />
    </main>
  );
}