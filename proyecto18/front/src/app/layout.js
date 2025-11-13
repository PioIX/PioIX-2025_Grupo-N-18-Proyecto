import './globals.css';

export const metadata = {
  title: 'Truco Argentino - Juego Online',
  description: 'Juega al Truco Argentino online contra la IA o contra otros jugadores',
  keywords: 'truco, argentino, juego, cartas, online, multijugador',
  authors: [{ name: 'Truco Game Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#16a34a',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#16a34a" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}