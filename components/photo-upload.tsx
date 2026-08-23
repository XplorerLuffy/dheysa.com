'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ImagePlus, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function PhotoUpload({ images, onChange }: { images: string[]; onChange: (images: string[]) => void }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    setUploading(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError('Sign in to upload photos.');
        return;
      }

      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        if (!ACCEPTED_TYPES.includes(file.type)) continue;
        const ext = file.name.split('.').pop() ?? 'jpg';
        const path = `${user.id}/${crypto.randomUUID()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('listing-photos')
          .upload(path, file, { cacheControl: '3600', upsert: false });

        if (uploadError) {
          setError(uploadError.message);
          continue;
        }

        const { data } = supabase.storage.from('listing-photos').getPublicUrl(path);
        uploaded.push(data.publicUrl);
      }

      if (uploaded.length) onChange([...images, ...uploaded]);
    } finally {
      setUploading(false);
    }
  }

  function removeImage(url: string) {
    onChange(images.filter((i) => i !== url));
  }

  return (
    <div>
      <label className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-brand-950/15 px-4 py-6 text-center text-sm text-brand-500 transition hover:border-brand-400 hover:bg-brand-50">
        <ImagePlus size={20} className="text-brand-400" />
        {uploading ? 'Uploading…' : 'Add photos (optional, you can add more later)'}
        <input
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          multiple
          className="hidden"
          disabled={uploading}
          onChange={(e) => handleFiles(e.target.files)}
        />
      </label>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {images.length > 0 && (
        <div className="mt-3 grid grid-cols-4 gap-2">
          {images.map((url) => (
            <div key={url} className="relative aspect-square overflow-hidden rounded-lg bg-brand-50">
              <Image src={url} alt="" fill className="object-cover" sizes="120px" />
              <button
                type="button"
                onClick={() => removeImage(url)}
                aria-label="Remove photo"
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
