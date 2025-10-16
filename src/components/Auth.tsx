import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (error: any) {
      alert(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      alert(
        "Registration successful! Please check your email for verification."
      );
    } catch (error: any) {
      alert(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Candidate Management</h1>
        <p className="text-gray-400">Sign in or register to continue</p>
      </div>
      <form className="space-y-4" onSubmit={handleLogin}>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-300"
          >
            Email
          </label>
          <input
            id="email"
            className="mt-1 block w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail((e.target as HTMLInputElement).value)}
            required
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-300"
          >
            Password
          </label>
          <input
            id="password"
            className="mt-1 block w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword((e.target as HTMLInputElement).value)}
            required
          />
        </div>
        <div className="flex space-x-4 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 font-bold text-gray-900 bg-sky-400 rounded-md hover:bg-sky-500 disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            {loading ? "Loading..." : "Login"}
          </button>
          <button
            type="button"
            onClick={handleRegister}
            disabled={loading}
            className="w-full px-4 py-2 font-bold text-white bg-gray-600 rounded-md hover:bg-gray-500 disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            {loading ? "Loading..." : "Register"}
          </button>
        </div>
      </form>
    </div>
  );
}
