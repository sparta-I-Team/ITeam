"use server";

import { redirect } from "next/navigation";
import { SignUpWithPasswordCredentials, User } from "@supabase/supabase-js";
import { createClient } from "@/utlis/supabase/server";
import { SignupInput } from "@/app/(auth)/signup/components/SignupForm";
import { LoginInput } from "@/app/(auth)/login/components/LoginForm";

// 로그인
export const login = async (loginInput: LoginInput) => {
  const supabase = createClient();
  const data = {
    email: loginInput.email,
    password: loginInput.password
  };
  const { error } = await supabase.auth.signInWithPassword(data);
  if (error) {
    console.error("로그인 오류", error);
    throw new Error(error.message);
  }
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) {
    console.error("유저 정보 가져오기 오류:", userError);
  } else {
    console.log("로그인된 유저:", userData.user); // 유저 정보 출력
  }
  redirect("/");
};

// 회원가입
export const signup = async (signupInput: SignupInput) => {
  const supabase = createClient();
  const data: SignUpWithPasswordCredentials = {
    email: signupInput.email,
    password: signupInput.password,
    options: {
      data: {
        nickname: signupInput.nickname
      }
    }
  };
  const { error } = await supabase.auth.signUp(data);
  await supabase.auth.signOut();
  if (error) {
    console.error("회원가입 에러", error);
  } else {
    await supabase.auth.signOut();
    redirect("/login");
  }
};

// 로그아웃
export const signout = async () => {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("로그아웃 에러", error);
  }
  redirect("/login");
};

// 카카오 로그인
export const signInWithKakao = async () => {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "kakao",
    options: {
      redirectTo: "http://localhost:3000/login/callback"
    }
  });
  if (error) {
    console.error("카카오 로그인 에러", error);
  }
  return data.url;
};

export const getUser = async (): Promise<User | null> => {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error(error);
  }
  return data.user;
};
