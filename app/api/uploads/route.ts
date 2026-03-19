/**
 * POST /api/uploads
 * Handles image uploads for company logos and BrandUp gallery.
 * Dev: stores in /public/uploads
 * Prod: if CLOUDINARY_CLOUD_NAME is set, uses Cloudinary
 */
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE_BYTES } from '@/lib/validations';

export async function POST(req: NextRequest) {
  try {
    // Auth check — only logged-in companies can upload
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type as typeof ALLOWED_IMAGE_TYPES[number])) {
      return NextResponse.json(
        { error: `File type not allowed. Accepted: ${ALLOWED_IMAGE_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: 'File too large. Maximum size: 5MB' },
        { status: 400 }
      );
    }

    const bytes  = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Use Cloudinary in production if configured
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      return uploadToCloudinary(buffer, file.type, session.user.slug);
    }

    // Dev: save to /public/uploads
    const ext      = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
    const filename = `${Date.now()}-${session.user.slug}-${Math.random().toString(36).slice(2)}.${ext}`;
    const dir      = path.join(process.cwd(), 'public', 'uploads');

    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, filename), buffer);

    return NextResponse.json({ url: `/uploads/${filename}` });
  } catch (err) {
    console.error('[POST /api/uploads]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Upload to Cloudinary using the REST API (no SDK dependency).
 * Requires CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET env vars.
 */
async function uploadToCloudinary(
  buffer: Buffer,
  mimeType: string,
  folder: string
): Promise<NextResponse> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME!;
  const apiKey    = process.env.CLOUDINARY_API_KEY!;
  const apiSecret = process.env.CLOUDINARY_API_SECRET!;

  const timestamp = Math.round(Date.now() / 1000).toString();
  const signature = await buildCloudinarySignature({ folder, timestamp, apiSecret });

  const formData = new FormData();
  const blob = new Blob([new Uint8Array(buffer)], { type: mimeType });
  formData.append('file', blob);
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp);
  formData.append('folder', `market-up/${folder}`);
  formData.append('signature', signature);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: 'POST', body: formData }
  );

  if (!res.ok) {
    const err = await res.json();
    console.error('[Cloudinary upload]', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }

  const data = await res.json() as { secure_url: string };
  return NextResponse.json({ url: data.secure_url });
}

/** SHA-1 signature for Cloudinary REST API (runs in Node.js environment) */
async function buildCloudinarySignature(params: {
  folder: string;
  timestamp: string;
  apiSecret: string;
}): Promise<string> {
  const { createHash } = await import('crypto');
  const str = `folder=${params.folder}&timestamp=${params.timestamp}${params.apiSecret}`;
  return createHash('sha1').update(str).digest('hex');
}
