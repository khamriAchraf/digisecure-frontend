import useSWR from 'swr';
import { useSession, getSession, signOut } from 'next-auth/react';

// Base URL for the backend API – change this to match your backend configuration
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000/api/v1';

// Generic fetcher that handles JSON responses, transparently refreshes the
// access token on 401 and signs the user out if refresh also fails.
const jsonFetcher = async (url, token, retry = true) => {
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    credentials: 'include',
  });

  if (res.ok) {
    return res.json();
  }

  // If we got 401/403, try to refresh the session *once*
  if (retry && (res.status === 401 || res.status === 403)) {
    try {
      // Will trigger NextAuth's JWT callback and refresh logic
      const newSession = await getSession();

      // If we obtained a new access token different from the previous one, retry once
      if (newSession?.accessToken && newSession.accessToken !== token) {
        return jsonFetcher(url, newSession.accessToken, false);
      }
    } catch (err) {
      // Ignore and fall through to signOut below
    }

    // Either refresh failed or we still have no valid token -> sign out
    signOut({ callbackUrl: '/login' });
  }

  const error = new Error('An error occurred while fetching the data');
  error.info = await res.json().catch(() => ({}));
  error.status = res.status;
  throw error;
};

/**
 * Hook: useUsers
 * Fetches the list of users from the backend `/users` endpoint.
 * Returns { users, isLoading, isError, mutate } where:
 *   • users – array with user objects (or undefined while loading)
 *   • isLoading – true while the request is in flight
 *   • isError – error object if the request failed
 *   • mutate – SWR mutate helper (e.g. to revalidate)
 */
export const useUsers = () => {
  const { data: session } = useSession();
  const token = session?.accessToken; // Adjust if your token lives under a different key

  const { data, error, isLoading, mutate } = useSWR(
    `${API_BASE}/users`,
    (url) => jsonFetcher(url, token)
  );

  return {
    users: data,
    isLoading,
    isError: error,
    mutate,
  };
};

// Export helpers (fetcher & base URL) in case they are useful elsewhere
export { jsonFetcher, API_BASE }; 