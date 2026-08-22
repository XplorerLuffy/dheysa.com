import { ListingBrowsePage } from '@/components/listing-browse';

export default function HomestaysPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  return <ListingBrowsePage type="homestay" searchParams={searchParams} />;
}
