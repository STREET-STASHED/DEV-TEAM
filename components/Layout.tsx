import { ReactNode } from "react";
import { useRouter } from "next/router";
import { useSupabase } from "../context/SupabaseContext";
import CartDrawer from "./CartDrawer";
import Header from "./Header";


interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  useSupabase();
  const router = useRouter();

  const hideNav =
    router.pathname.startsWith("/auth") ||
    router.pathname === "/reset-password";


  return (
    <div
      className="app-layout"
      style={{
        backgroundImage: `url('/background.png')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        minHeight: "100vh",
        position: "relative",
        zIndex: 0,
      }}
    >
      {/* Overlay for better text contrast */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          zIndex: 1,
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 2,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {!hideNav && <Header />}

        <main
          className="app-content"
          style={{
            flex: 1,
            display: "flex",
            justifyContent: hideNav ? "center" : "initial",
            alignItems: hideNav ? "center" : "initial",
            padding: "2rem",
          }}
        >
          {hideNav ? (
            <div
              className="auth-container"
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
              }}
            >
              <div
                className="auth-card"
                style={{
                  backgroundColor: "rgba(0, 0, 0, 0.75)",
                  backdropFilter: "blur(10px)",
                  padding: "2rem",
                  borderRadius: "12px",
                  boxShadow: "0 0 20px rgba(255, 215, 0, 0.1)",
                  width: "100%",
                  maxWidth: "400px",
                  color: "#fff",
                }}
              >
                {children}
              </div>
            </div>
          ) : (
            children
          )}
        </main>

        {!hideNav && (
          <footer
            className="app-footer"
            style={{ textAlign: "center", padding: "1rem", color: "white" }}
          >
            <p>
              &copy; {new Date().getFullYear()} StreetStashed. All rights
              reserved.
            </p>
          </footer>
        )}
        <CartDrawer />
      </div>
    </div>
  );
}
