import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
      <div className="max-w-2xl">
        <h1 className="text-5xl font-bold tracking-tight text-slate-900 mb-4">
          Bedrock
        </h1>
        <p className="text-xl text-slate-600 mb-2">
          Know what you actually believe.
        </p>
        <p className="text-slate-500 mb-10">
          A civic identity platform for independent-minded voters.
          <br />
          Not red. Not blue. Red, white, and blue.
        </p>
        <Link
          href="/quiz"
          className="inline-block bg-slate-900 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-slate-700 transition-colors"
        >
          Find your bedrock →
        </Link>
      </div>
    </main>
  );
}
