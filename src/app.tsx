import { useState, useEffect } from "react";
import { supabase } from "./lib/supabaseClient";
import Auth from "./components/Auth";
import type { Session } from "@supabase/supabase-js";
import Dashboard from "./components/Dashboard/Dashboard";
import { Toaster } from "react-hot-toast";
function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <Toaster position="top-center" reverseOrder={false} />
      <div
        className={`w-full p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg ${
          !session ? "max-w-md" : "max-w-4xl"
        }`}
      >
        {!session ? (
          <Auth />
        ) : (
          <div>
            <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
              <h2 className="text-xl">
                Welcome,{" "}
                <span className="font-bold text-sky-400">
                  {session.user.email}
                </span>
              </h2>
              <button
                onClick={() => supabase.auth.signOut()}
                className="px-4 py-2 font-bold text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500"
              >
                Sign Out
              </button>
            </div>

            <Dashboard user={session.user} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
