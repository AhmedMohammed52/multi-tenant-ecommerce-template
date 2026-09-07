import { useStore } from "./contexts/StoreContext";
import { useAuth } from "./contexts/AuthContext";

function App() {
  const { store } = useStore();

  const { user, role, isAuthenticated, isAdmin } = useAuth();

  return (
    <>
      <div className="min-h-screen p-8 text-center bg-background text-foreground">
        <h1 className="text-4xl font-bold mb-6">{store?.name}</h1>

        <div className="space-y-2">
          <p>Authenticated: {isAuthenticated ? "YES" : "NO"}</p>

          <p>User: {user?.email || "Not logged in"}</p>

          <p>Role: {role || "No role"}</p>

          <p>Admin: {isAdmin ? "YES" : "NO"}</p>
        </div>
      </div>
    </>
  );
}

export default App;
