import Header from './Header';

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-6 py-8 max-w-7xl">
        {children}
      </main>
    </div>
  );
}

export default Layout;
