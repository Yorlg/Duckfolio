import {
  createUnauthorizedResponse,
  isAdminAuthorized,
  writeRepositoryBinaryFile,
} from "@/lib/admin/content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const PNG_END = Buffer.from([0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130]);
const imagePaths = {
  avatar: "public/avatar.png",
  logo: "public/logo.png",
} as const;

export async function POST(request: Request) {
  if (!isAdminAuthorized(request)) {
    return createUnauthorizedResponse();
  }

  try {
    const formData = await request.formData();
    const kind = formData.get("kind");
    const file = formData.get("file");

    if (kind !== "avatar" && kind !== "logo") {
      return Response.json({ message: "请选择头像或 Logo。" }, { status: 400 });
    }

    if (
      !(file instanceof File) ||
      file.type !== "image/png" ||
      file.size < 45 ||
      file.size > MAX_IMAGE_SIZE
    ) {
      return Response.json(
        { message: "请上传不超过 5MB 的 PNG 图片。" },
        { status: 400 },
      );
    }

    const content = Buffer.from(await file.arrayBuffer());
    const ihdr = content.subarray(12, 16).toString("ascii") === "IHDR";
    if (
      !content.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE) ||
      content.readUInt32BE(8) !== 13 ||
      !ihdr ||
      content.readUInt32BE(16) === 0 ||
      content.readUInt32BE(20) === 0 ||
      !content.subarray(-PNG_END.length).equals(PNG_END)
    ) {
      return Response.json({ message: "PNG 图片内容无效。" }, { status: 400 });
    }

    const filePath = imagePaths[kind];
    const result = await writeRepositoryBinaryFile({
      content,
      filePath,
      message: `chore: update site ${kind}`,
    });

    return Response.json({
      message: "站点图片已更新。",
      result,
      url: `/${kind}.png`,
    });
  } catch (error) {
    return Response.json(
      {
        message: error instanceof Error ? error.message : "站点图片上传失败。",
      },
      { status: 500 },
    );
  }
}
