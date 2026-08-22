import { ListingBrowsePage } from '@/components/listing-browse';

export default function HotelsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  return <ListingBrowsePage type="hotel" searchParams={searchParams} />;
}
