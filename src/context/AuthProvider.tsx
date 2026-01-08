import { createContext, useContext, useEffect, useState } from "react";
import { UserSchema } from "@/util";
import type z from "zod";
import { toast, ToastContainer } from "react-toastify";
import { apiFetch } from "@/util/apiFetch";
interface AuthProps {
  children: React.ReactNode;
}
type User = z.infer<typeof UserSchema>;
type ContextType = {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  logout: () => void;
};

const AuthContext = createContext<ContextType | null>(null);
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used inside AuthProvider");
  }
  return context;
};
export const AuthProvider: React.FC<AuthProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function logout() {
    try {
      const res = await apiFetch({
        url: "/v1/auth/logout",
        options: {
          method: "DELETE",
          headers: { authorization: `Bearer ${user?.token}` },
        },
        setState: setUser,
      });
      if (!res.ok) {
        toast.error("Logout unsuccessfull");
        return;
      }
      toast.success("Successfully logout");
      setUser(null);
    } catch (error) {
      toast.error(`Error in logout, error is ${error}`);
    }
  }

  useEffect(() => {
    let mounted = true;
    async function silentLogin() {
      try {
        const res = await fetch("/v1/auth/refresh-token", {
          method: "POST",
          credentials: "include",
        });
        if (res.status === 401) {
          setUser(null);
        }
        if (!res.ok) return;

        const resData = (await res.json()) as {
          message: string;
          user: User;
        };
        if (mounted) setUser(resData.user);
      } catch (error) {
        console.log("Silent login failed: ", error);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    silentLogin();
    () => (mounted = false);
  }, []);
  if (loading) return <div>Loading...</div>;
  return (
    <AuthContext value={{ user, setUser, logout }}>
      {children}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </AuthContext>
  );
};
