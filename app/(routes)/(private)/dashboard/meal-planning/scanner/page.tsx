import { ScannerClient } from './_comp/client';

export default function ScannerPage() {
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Ingredient Scanner</h1>
      <ScannerClient />
    </div>
  );
}
