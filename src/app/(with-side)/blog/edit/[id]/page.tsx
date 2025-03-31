"use client";
import { BlogRow, getBlogId } from "@/app/actions/blog-action";
import EditEditor from "@/components/editor/edit-editor";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const Page = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState<BlogRow | null>(null);

  const fetchGetBlogId = async () => {
    const { data, error, status } = await getBlogId(Number(id));
    if (data) {
      setBlog(data);
    }
  };

  useEffect(() => {
    fetchGetBlogId();
  }, []);

  return (
    <div className="w-[920px] h-screen bg-[#f9f9f9] border-r border-[#d6d6d6] flex items-start justify-center">
      {blog ? <EditEditor blog={blog} /> : <div>자료가 없습니다.</div>}
    </div>
  );
};
export default Page;
