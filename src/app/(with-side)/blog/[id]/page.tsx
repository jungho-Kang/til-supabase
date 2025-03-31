"use client";

import { BlogRow, deleteBlog, getBlogId } from "@/app/actions/blog-action";
import { Button } from "@/components/ui/button";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Page = () => {
  const router = useRouter();
  // id는 무조건 string입니다
  const { id } = useParams();
  const [blogData, setBlogData] = useState<BlogRow | null>(null);
  const fetchGetBlogId = async () => {
    const { data, error, status } = await getBlogId(Number(id));
    console.log(data);
    setBlogData(data);
  };

  // 내용 삭제 : 이미지도 같이 삭제
  const deleteContent = async () => {
    console.log("이미지 삭제처리 필요");
    const { error, status } = await deleteBlog(Number(id));
    if (!error) {
      router.push("/blog");
    }
  };

  useEffect(() => {
    fetchGetBlogId();
  }, []);

  return (
    <div className="w-[920px] h-screen bg-[#f9f9f9] border-r border-[#d6d6d6] flex items-start justify-center">
      <div className="w-full flex flex-col p-4">
        <h1 className="w-full text-center text-xl mb-4 font-bold">Blog Read</h1>
        <div className="space-y-2">
          <div className="text-lg font-semibold mb-2">{blogData?.title}</div>
          <div className="text-gray-600 text-sm mb-4">
            {blogData?.created_at.split("T")[0]}
          </div>
          <p
            className="editor ProseMirror"
            dangerouslySetInnerHTML={{ __html: blogData?.content || "" }}
          />
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button
            className="bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors cursor-pointer"
            onClick={() => router.push(`/blog/edit/${id}`)}
          >
            수정
          </Button>
          <Button
            className="bg-gray-700 text-white rounded hover:bg-gray-800 transition-colors cursor-pointer"
            onClick={() => deleteContent()}
          >
            삭제
          </Button>
        </div>
      </div>
    </div>
  );
};
export default Page;
