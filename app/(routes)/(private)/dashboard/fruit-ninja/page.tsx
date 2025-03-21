export default function Page() {
  return (
    <div className="container">
      <iframe
        src="/fruit-ninja/index.html"
        style={{ width: '100%', height: '100vh', border: 'none' }}
        title="Fruit Ninja Game"
        loading="lazy"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
}
