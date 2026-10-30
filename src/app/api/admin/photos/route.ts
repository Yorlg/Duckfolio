import {
  createUnauthorizedResponse,
  isAdminAuthorized,
} from '@/lib/admin/content';
import {
  importRepositoryPhoto,
  listRepositoryPhotos,
  PhotoRequestError,
  saveRepositoryPhotos,
  uploadRepositoryPhoto,
} from '@/lib/admin/photos';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function failure(error: unknown) {
  return Response.json(
    {
      message: error instanceof Error ? error.message : 'photoOperationFailed',
    },
    {
      status:
        error instanceof PhotoRequestError || error instanceof SyntaxError
          ? 400
          : 500,
    },
  );
}

export async function GET(request: Request) {
  if (!isAdminAuthorized(request)) return createUnauthorizedResponse();
  try {
    return Response.json({ photos: await listRepositoryPhotos() });
  } catch (error) {
    return failure(error);
  }
}

export async function POST(request: Request) {
  if (!isAdminAuthorized(request)) return createUnauthorizedResponse();
  try {
    if (request.headers.get('content-type')?.includes('application/json')) {
      const body = await request.json();
      return Response.json(
        await importRepositoryPhoto(body?.mediaPath, body?.timestamp),
      );
    }
    const formData = await request.formData();
    const file = formData.get('file');
    if (!(file instanceof File))
      throw new PhotoRequestError('selectAFileToUpload');
    return Response.json(
      await uploadRepositoryPhoto(file, formData.get('timestamp') ?? undefined),
    );
  } catch (error) {
    return failure(error);
  }
}

export async function PUT(request: Request) {
  if (!isAdminAuthorized(request)) return createUnauthorizedResponse();
  try {
    const body = await request.json();
    return Response.json({ result: await saveRepositoryPhotos(body?.photos) });
  } catch (error) {
    return failure(error);
  }
}
