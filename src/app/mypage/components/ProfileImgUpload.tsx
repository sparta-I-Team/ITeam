"use client";
import { useState, useEffect } from "react";
import {
  getUserInfo,
  updateAvatarUrl,
  uploadProfileImage
} from "@/api/user-action";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";

interface ProfileImgUploadProps {
  userId: string;
  userAvatar?: string; // userAvatar를 선택적 prop으로 정의
}

const ProfileImgUpload = ({ userId, userAvatar }: ProfileImgUploadProps) => {
  const { register, handleSubmit, setValue } = useForm();
  const [previewImage, setPreviewImage] = useState<string | undefined>(
    userAvatar
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const queryClient = useQueryClient();

  // userAvatar가 변경될 때 previewImage를 초기화
  useEffect(() => {
    setPreviewImage(userAvatar);
  }, [userAvatar]);

  const { refetch } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => getUserInfo(userId)
  });

  const { mutate } = useMutation({
    mutationFn: async (newAvatarUrl: string) => {
      const response = await updateAvatarUrl(userId, newAvatarUrl);
      return response;
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: ["user", userId]
      });
      const updatedUser = await refetch();
      if (updatedUser.data) {
        setPreviewImage(updatedUser.data.user_avatar); // 새로운 아바타 URL로 업데이트 ++ 수정
      }
      setSelectedFile(null);
      window.alert("프로필 이미지가 성공적으로 업데이트되었습니다.");
    },
    onError: (error) => {
      console.error("프로필 업데이트 오류:", error);
      window.alert("프로필 이미지 업데이트에 실패했습니다.");
    }
  });
  const onSubmit = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("profileImage", selectedFile);

    try {
      const response = await uploadProfileImage(userId, formData);
      if (response) {
        const { publicUrl } = response;
        if (publicUrl) {
          // 프리뷰 업데이트
          setPreviewImage(publicUrl);
          // 아바타 URL 업데이트
          mutate(publicUrl);
        } else {
          console.error("이미지 업로드에 실패했습니다.");
        }
      }
    } catch (error) {
      console.error("업로드 중 오류 발생:", error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setValue("profileImage", file);

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        console.log("읽어온 이미지 데이터:", result); // 디버깅용 로그
        setPreviewImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCancel = () => {
    refetch();
    setSelectedFile(null); // 선택된 파일 초기화
    setPreviewImage(userAvatar); // 원래 아바타로 프리뷰 초기화
    setValue("profileImage", undefined); // form 상태에서 파일 초기화
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col items-center"
    >
      <label htmlFor="profileImage">
        <Image
          src={previewImage || "/images/default-profile"}
          alt="미리보기"
          width={64}
          height={64}
          className="w-16 h-16 cursor-pointer object-cover"
        />
      </label>
      <input
        type="file"
        id="profileImage"
        className="hidden"
        accept="image/*"
        {...register("profileImage")}
        onChange={handleImageChange}
      />
      {/* 파일이 선택된 경우에만 변경 저장 버튼 표시 */}
      {selectedFile && (
        <div>
          <button type="submit">저장</button>
          <button type="button" onClick={handleCancel}>
            취소
          </button>
        </div>
      )}
    </form>
  );
};

export default ProfileImgUpload;
