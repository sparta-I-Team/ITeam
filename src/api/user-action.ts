"use server";

import { createClient } from "@/utlis/supabase/server";

export const getUserInfo = async (userId: string) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("user_info")
    .select()
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error(error);
    return null;
  }
  return data;
};

// 닉네임 업데이트
export const updateNickname = async ({
  userId,
  newNickname
}: {
  userId: string;
  newNickname: string;
}) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("user_info")
    .update({ user_nickname: newNickname })
    .eq("user_id", userId)
    .select();

  if (error) {
    console.error("닉네임 업데이트 오류", error);
    return null;
  }
  return data;
};

// 내가 쓴 글 가져오기
export const getMyPosts = async (userId: string) => {
  const supabase = createClient();
  const { data: posts, error } = await supabase
    .from("posts")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    console.error("내가 쓴 글 가져오기 오류", error);
    return null;
  }
  return posts || [];
};

// 닉네임 중복 검사
export const checkNicknameAvailability = async (
  newNickname: string,
  userId: string
) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("user_info")
    .select("user_nickname")
    .eq("user_nickname", newNickname)
    .neq("user_id", userId) // 현재 사용자의 아이디를 제외
    .limit(1);

  if (error) {
    console.error("닉네임 중복 검사 오류", error);
    return null;
  }
  return data.length === 0; // 사용 가능하면 true, 중복이면 false
};

// 좋아요 게시글 가져오기
export const getLikePosts = async (userId: string) => {
  const supabase = createClient();
  const { data: likes, error } = await supabase
    .from("likes")
    .select("*, posts(*)")
    .eq("user_id", userId);

  if (error) {
    console.error("좋아요 post 가져오기 오류", error);
    return null;
  }
  return likes;
};

// 스토리지에 프로필 이미지 업로드
export const uploadProfileImage = async (
  userId: string,
  formData: FormData
) => {
  const supabase = createClient();
  const file = formData.get("profileImage") as File; // FormData에서 파일 가져오기
  if (!file) return;
  const filePath = `/${userId}/${file.name}`; // userId 폴더에 저장
  // 스토리지 업로드
  const { error } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, {
      cacheControl: "3600", // 캐시 제어 설정 (1시간)
      upsert: true // 기존 파일이 있을 경우 덮어쓰기
    });

  if (error) {
    throw new Error("이미지 업로드 실패: " + error.message);
  }
  // 업로드한 파일의 공용 URL 가져오기
  const publicUrl = supabase.storage
    .from("avatars")
    .getPublicUrl(filePath).data; // filePath를 사용하여 URL 생성
  return publicUrl; // 업로드한 이미지의 공용 URL 반환
};

// 테이블에 프로필 이미지 업데이트
export const updateAvatarUrl = async (userId: string, newAvatarUrl: string) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("user_info")
    .update({ user_avatar: newAvatarUrl })
    .eq("user_id", userId)
    .select();

  if (error) {
    console.error("프로필 업데이트 오류", error);
    return null;
  }
  console.log("프로필 업데이트 성공");
  return data;
};
