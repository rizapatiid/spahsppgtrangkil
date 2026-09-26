import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { folder } = body;

    const timestamp = Math.round(new Date().getTime() / 1000);
    
    const paramsToSign: Record<string, any> = {
      timestamp,
    };
    
    if (folder) {
      paramsToSign.folder = folder;
    }

    const signature = cloudinary.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET as string);

    return NextResponse.json({ 
      timestamp, 
      signature, 
      apiKey: process.env.CLOUDINARY_API_KEY, 
      cloudName: process.env.CLOUDINARY_CLOUD_NAME 
    });
  } catch (error: any) {
    console.error("Signature generation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
