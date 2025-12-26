import { useForm } from '@inertiajs/react';

export default function PinLogin() {
  const { data, setData, post, processing, errors } = useForm({
    pin: '',
  });

  const submit = (e) => {
    e.preventDefault();
    post('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={submit} className="bg-white p-6 rounded shadow w-80">
        <h1 className="text-xl font-bold mb-4 text-center">Enter PIN</h1>

        <input
          type="password"
          maxLength={6}
          autoFocus
          value={data.pin}
          onChange={e => setData('pin', e.target.value)}
          className="w-full border rounded px-3 py-2 text-center text-lg tracking-widest"
          placeholder="••••••"
        />

        {errors.pin && (
          <div className="text-red-600 text-sm mt-2 text-center">
            {errors.pin}
          </div>
        )}

        <button
          type="submit"
          disabled={processing}
          className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Login
        </button>
      </form>
    </div>
  );
}
