import Image from 'next/image';

export function Gallery({ images, title }: { images: string[]; title: string }) {
  if (!images.length) {
    return (
      <div className="flex aspect-[16/9] w-full items-center justify-center rounded-3xl bg-brand-100 text-brand-400">
        No photos yet
      </div>
    );
  }

  const [main, ...rest] = images;

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-4 sm:grid-rows-2">
      <div className="relative aspect-[16/9] overflow-hidden rounded-3xl bg-brand-100 sm:col-span-2 sm:row-span-2 sm:aspect-auto">
        <Image src={main} alt={title} fill className="object-cover" sizes="50vw" priority />
      </div>
      {rest.slice(0, 4).map((src, i) => (
        <div
          key={src + i}
          className="relative hidden aspect-square overflow-hidden rounded-2xl bg-brand-100 sm:block"
        >
          <Image src={src} alt={`${title} photo ${i + 2}`} fill className="object-cover" sizes="25vw" />
        </div>
      ))}
    </div>
  );
}
