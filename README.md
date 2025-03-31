# file 관련

## action 관련

### 1. 파일 처리

- /src/app/actions/blog-storage-action.ts

```ts
"use server";

import { createServerSideClient } from "@/lib/supabase/server";

// 에러 타입에 대해서 파악하기
function handleError(error: unknown) {
  if (error) {
    console.error(error);
    throw error;
  }
}

// 파일 업로드
export async function uploadFile(formData: FormData): Promise<{
  id: string;
  path: string;
  fullPath: string;
} | null> {
  try {
    const supabase = await createServerSideClient();

    // // getUser()를 사용하여 인증된 사용자 정보 가져오기
    // const {
    //   data: { user },
    //   error: userError,
    // } = await supabase.auth.getUser();

    // if (userError || !user) {
    //   console.error("인증된 사용자가 아닙니다.");
    //   return null;
    // }

    const file = formData.get("file") as File;

    // 파일 이름에 사용자 ID를 포함시켜 고유성 보장
    const fileExt = file.name.split(".").pop();

    // 인증 과정을 거치고 나면 사용자 ID를 이용해서 파일을 생성한다
    // const fileName = `${user.id}_${Date.now()}.${fileExt}`;
    const fileName = `${"tester"}_${Date.now()}.${fileExt}`;

    // upsert : insert 와 update 를 동시에 처리할 수 있는 옵션
    const { data, error } = await supabase.storage
      .from(process.env.NEXT_PUBLIC_STORAGE_BLOG_BUCKET as string)
      .upload(fileName, file, { upsert: true });

    if (error) {
      handleError(error);
      return null; // 에러 발생 시 null 반환
    }

    return data;
  } catch (error) {
    handleError(error);
    return null;
  }
}

// supabase에서 파일 삭제
export async function deleteFile(fileName: string) {
  const supabase = await createServerSideClient();

  // 파일 삭제 시 파일명을 배열의 요소로 추가해서 삭제한다
  const { data, error } = await supabase.storage
    .from(process.env.NEXT_PUBLIC_STORAGE_BLOG_BUCKET as string)
    .remove([fileName]);

  handleError(error);

  return data;
}
```

## 에디터 관련

- delete와 backspace 키보드에 대한 처리를 진행
- 작성 중인 내용에서 img 태그의 src에 담긴 글자를 분석해서 파일명을 파악
- 발견한 파일명 문자열을 action의 deleteFile(파일명)을 전달해야 합니다
- /src/components/editor/create-editor.tsx

```tsx
"use client";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
// css
import styles from "@/components/editor/editor.module.css";
import ToolBar from "./toolbar";
// extension : 내용 정렬
import TextAlign from "@tiptap/extension-text-align";
// extension : color
import { Color } from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
// extension : code block, background-color
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Highlight from "@tiptap/extension-highlight";
import { common, createLowlight } from "lowlight";
// extension : Link
import Link from "@tiptap/extension-link";
// extension : Image
import Image from "@tiptap/extension-image";
// shadcn/ui
import { createBlog } from "@/app/actions/blog-action";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { deleteFile } from "@/app/actions/blog-storage-action";

function CreateEditor() {
  // 내용
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");

  // 배경색
  const lowlight = createLowlight(common);
  const CustomHighlight = Highlight.configure({
    multicolor: true,
  });

  // 에디터
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ["heading", "paragraph", "blockquote"],
        alignments: ["left", "center", "right"],
      }),
      Color,
      TextStyle,
      CodeBlockLowlight.configure({
        lowlight: lowlight,
      }),
      CustomHighlight,
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          class: "cursor-pointer text-blue-500 hover:underline",
        },
      }),
      Image,
    ],
    content, // 초기값
    // 내용 갱신 시 실행
    onUpdate({ editor }) {
      // 내용 읽기
      setContent(editor.getHTML());
    },

    // 에디터의 내용 분석하기
    editorProps: {
      handleKeyDown: (view, event) => {
        if (event.key === "Backspace" || event.key === "Delete") {
          const { from, to } = view.state.selection;
          // Case 1: 단일 이미지 노드가 선택된 경우
          const currentNode = view.state.doc.nodeAt(from);
          if (currentNode?.type.name === "image") {
            const imageUrl = currentNode.attrs.src;
            // Supabase에 저장된 이미지인 경우에만 처리
            if (imageUrl.includes("supabase")) {
              console.log("Single image delete:", imageUrl);
              deleteImageFromSupabase(imageUrl); // 실제 삭제 함수 호출 (현재는 주석 처리됨)
            }
            return false; // 기본 삭제 동작 방지
          }

          // Case 2: Backspace로 이미지 삭제하는 경우
          // 커서가 이미지 바로 뒤에 있을 때 (from과 to가 같음 = 선택된 영역이 없음)
          if (event.key === "Backspace" && from === to) {
            const nodeBefore = view.state.doc.nodeAt(from - 1);
            if (nodeBefore?.type.name === "image") {
              const imageUrl = nodeBefore.attrs.src;
              if (imageUrl.includes("supabase")) {
                console.log("Backspace image delete:", imageUrl);
                deleteImageFromSupabase(imageUrl);
              }
            }
          }

          // Case 3: 여러 노드가 선택된 경우 (드래그로 여러 요소 선택)
          if (from !== to) {
            let pos = from;
            // 선택된 영역 내의 모든 노드를 순회
            while (pos < to) {
              const node = view.state.doc.nodeAt(pos);
              // 이미지 노드를 발견하면 처리
              if (node?.type.name === "image") {
                const imageUrl = node.attrs.src;
                if (imageUrl.includes("supabase")) {
                  console.log("Selected image delete:", imageUrl);
                  deleteImageFromSupabase(imageUrl);
                }
              }
              // 다음 노드로 이동 (노드의 크기만큼 position 증가)
              pos += node ? node.nodeSize : 1;
            }
          }
        }
        // Backspace 키를 눌렀을 때 빈 blockquote 처리
        if (event.key === "Backspace") {
          const { selection } = view.state;
          const { empty, $anchor } = selection;
          const isBlockquote = $anchor.parent.type.name === "blockquote";

          if (empty && isBlockquote && $anchor.parent.content.size === 0) {
            editor?.commands.clearNodes();
            return true;
          }
        }
        return false;
      },
    },
  });

  // Supabase에서 이미지 삭제하는 함수
  const deleteImageFromSupabase = async (imageUrl: string) => {
    console.log("삭제된 이미지 파일명 추출 : ", imageUrl);

    try {
      // URL에서 파일명만 추출
      const fileNameMatch = imageUrl.match(/([^\/]+)$/);
      if (fileNameMatch) {
        const fileName = fileNameMatch[1]; // "slide-3.png"
        console.log("Deleting image from Supabase:", fileName);
        await deleteFile(fileName); // await로 삭제 완료 대기
      }
    } catch (error) {
      console.error("Error deleting image from Supabase:", error);
    }
  };

  const onSubmit = async () => {
    const { data, error, status } = await createBlog({
      title,
      content,
    });
    if (!title || !content) {
      toast.error("내용과 제목을 입력해주세요.");
      return;
    }

    toast.success("글이 성공적으로 등록되었습니다.");

    // 내용 초기화
    if (editor) {
      editor?.commands.clearContent();
    }
    setTitle("");
    setContent("");
  };

  return (
    <div className="w-[95%] flex flex-col bg-white my-3 p-3">
      <h3>블로그 작성하기</h3>
      <div className="w-full flex flex-col items-center justify-center">
        <div className="w-full my-2">
          <input
            className="w-full p-2 border-2 border-gray-300 rounded-md"
            placeholder="제목을 입력해주세요."
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className={`${styles.editor} w-full min-h-[500px]`}>
          {editor && <ToolBar editor={editor} />}
          <EditorContent editor={editor} />
        </div>
        <div className="flex w-full items-center justify-center p-2">
          <Button
            type="button"
            className="px-4 py-2 cursor-pointer"
            onClick={onSubmit}
          >
            Add Blog
          </Button>
        </div>
      </div>
    </div>
  );
}
export default CreateEditor;
```
