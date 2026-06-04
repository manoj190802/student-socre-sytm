import './globals.css';

export const metadata = {
  title: 'Student Score System',
  description: 'Manage student scores across 5 subjects',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
