"use client";

import { signout } from "@/api/auth-actions";

const LogoutButton = () => {
  const handleLogout = () => {
    window.confirm("정말 로그아웃하시겠습니까?");
    signout();
  };
  return <button onClick={handleLogout}>로그아웃</button>;
};

export default LogoutButton;
