import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Search, Film, User, LogOut, PlusSquare } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { toast } = useToast();

  const isActive = (path) => {
    // Considera ativo mesmo com parâmetros, exceto para o perfil que usa username
    if (path.includes(":")) return false; // Evita match genérico
    if (path === `/profile/${currentUser?.username}`)
      return location.pathname === path;
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    toast({ title: "Logout realizado com sucesso!" });
    navigate("/login");
  };

  const navItems = [
    { icon: Home, label: "Início", path: "/", requiresAuth: true },
    { icon: PlusSquare, label: "Postar", path: "/post", requiresAuth: true },
    { icon: Search, label: "Explorar", path: "/explore", requiresAuth: true },
    {
      icon: Film,
      label: "Minha Lista",
      path: "/watchlist",
      requiresAuth: true,
    },
    {
      icon: User,
      label: "Perfil",
      path: currentUser ? `/profile/${currentUser.username}` : "#",
      requiresAuth: true,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-10 h-14 md:relative md:h-screen md:w-64 md:border-t-0 md:border-r">
      <div className="flex items-center justify-around h-full px-2 md:flex-col md:justify-start md:h-full md:p-4">
        <Link
          to={currentUser ? "/" : "/login"}
          className="hidden md:flex items-center gap-2 p-4 mb-6"
        >
          <motion.div
            initial={{ rotate: -10 }}
            animate={{ rotate: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Film className="h-6 w-6 text-primary" />
          </motion.div>
          <h1 className="text-xl font-bold">FilmSocial</h1>
        </Link>

        <div className="flex justify-around w-full md:flex-col md:space-y-2">
          {navItems.map((item) => {
            const isDisabled = item.requiresAuth && !currentUser;
            const effectivePath = isDisabled ? "#" : item.path;

            return (
              <Link
                key={item.label}
                to={effectivePath}
                className={`nav-item ${
                  isActive(item.path) && !isDisabled ? "active" : ""
                } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={(e) => isDisabled && e.preventDefault()}
                aria-disabled={isDisabled}
              >
                <item.icon className="h-5 w-5" />
                <span className="hidden md:inline">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {currentUser ? (
          <div className="hidden md:mt-auto md:flex md:flex-col md:space-y-4">
            <div className="p-4 bg-card rounded-lg">
              <Link
                to={`/profile/${currentUser.username}`}
                className="flex items-center gap-3"
              >
                <Avatar>
                  <AvatarImage
                    src={currentUser.avatar}
                    alt={currentUser.name}
                  />
                  <AvatarFallback>
                    {currentUser.name ? currentUser.name.charAt(0) : "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{currentUser.name || "Usuário"}</p>
                  <p className="text-xs text-muted-foreground">
                    @{currentUser.username || "username"}
                  </p>
                </div>
              </Link>
            </div>

            <Button
              variant="ghost"
              onClick={handleLogout}
              className="nav-item justify-start text-muted-foreground hover:text-destructive"
            >
              <LogOut className="h-5 w-5" />
              <span className="hidden md:inline">Sair</span>
            </Button>
          </div>
        ) : (
          <div className="hidden md:mt-auto md:flex md:flex-col md:space-y-2">
            <Link
              to="/login"
              className={`nav-item ${isActive("/login") ? "active" : ""}`}
            >
              <User className="h-5 w-5" />
              <span className="hidden md:inline">Login</span>
            </Link>
            <Link
              to="/signup"
              className={`nav-item ${isActive("/signup") ? "active" : ""}`}
            >
              <PlusSquare className="h-5 w-5" />
              <span className="hidden md:inline">Cadastrar</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
