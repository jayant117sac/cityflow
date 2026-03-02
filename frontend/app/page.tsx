import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-blue-600 to-blue-800 text-white px-4">
      <h1 className="text-5xl font-bold mb-4">🏙️ CityFlow</h1>
      <p className="text-xl mb-8 text-blue-100">Connecting Citizens with City Services</p>
      <div className="flex gap-4">
        <Link href="/login" className="bg-white text-blue-700 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50">
          Login
        </Link>
        <Link href="/register" className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700">
          Register
        </Link>
      </div>
    </div>
  );
}