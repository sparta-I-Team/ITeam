"use client";
import { createClient } from "@/utlis/supabase/client";
import { userStore } from "@/zustand/userStore";
import Link from "next/link";
import React, { useState } from "react";

const Header = () => {
  const [isUserLoggedIn, setIsUserLoggedIn] = useState<boolean>(true);
  const { loginUser } = userStore();

  const handleLogout = () => {
    setIsUserLoggedIn(!isUserLoggedIn);
  };
  const supabase = createClient();
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === "INITIAL_SESSION") {
    }
    if (event === "SIGNED_IN") {
      // zustand 스토어에 사용자 정보 저장
      loginUser({
        email: session?.user.email as string,
        accessToken: session?.access_token as string,
        id: session?.user.id as string,
        isAuthenticated: true
      });
    }
  });

  return (
    <header>
      <nav
        className="max-w-[1200px] mx-auto flex flex-row justify-between"
        aria-label="Main Navigation"
      >
        <ul className="flex space-x-4">
          <li>
            <Link href="/">
              <h1>서비스명</h1>
            </Link>
          </li>
          <li>
            <Link href="/challenge">데일리 탄소 절감 활동(챌린지)</Link>
          </li>
          <li>
            <Link href="/calculator">탄소 계산기</Link>
          </li>
          <li>
            <Link href="/map">친환경 가게 Map</Link>
          </li>
          <li>
            <Link href="/community">커뮤니티</Link>
          </li>
        </ul>
        <ul className="flex flex-row space-x-4">
          {isUserLoggedIn ? (
            <>
              <li>
                <Link href="/login">로그인</Link>
                <button className="border-none" onClick={handleLogout}>
                  테스트
                </button>
              </li>
              <li>
                <Link href="/signup">회원가입</Link>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link href="/mypage">마이페이지</Link>
              </li>
              <li>
                <button className="border-none" onClick={handleLogout}>
                  로그아웃 테스트
                </button>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
