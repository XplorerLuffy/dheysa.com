'use client';

import { useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Building2, Home, Compass, Car, X } from 'lucide-react';
import { submitListing, updateListing, type ListingFormState } from '@/app/actions/listings';
import { formatCurrency } from '@/lib/format';
import { PhotoUpload } from '@/components/photo-upload';

const initialState: ListingFormState = { error: null };

const AMENITY_GROUPS: { label: string; items: string[] }[] = [
  { label: 'General', items: ['Free WiFi', 'Air conditioning', 'Heating', 'Hot water', 'Free parking'] },
  { label: 'Cooking & cleaning', items: ['Kitchen', 'Kitchenette', 'Breakfast included', 'Daily housekeeping'] },
  { label: 'Outside & extras', items: ['Mountain view', 'Garden view', 'Balcony', 'Flat-screen TV'] },
];

const LANGUAGES = ['English', 'Dzongkha', 'Hindi', 'Nepali', 'Mandarin'];

const COMMISSION_RATE = 0.05;

type Step = 1 | 2 | 3 | 4;
type PropertyType = 'hotel' | 'homestay' | '';
type PetsAllowed = 'yes' | 'upon_request' | 'no';
type RoomType = { name: string; price: string; maxGuests: string; count: string };

export type NewListingWizardInitial = {
  type: PropertyType;
  title: string;
  location: string;
  description: string;
  images: string[];
  priceBase: string;
  maxGuests: string;
  bedrooms: string;
  bathrooms: string;
  roomCount: string;
  roomTypes: RoomType[];
  sizeSqm: string;
  amenities: string[];
  languages: string[];
  smokingAllowed: boolean;
  partiesAllowed: boolean;
  childrenAllowed: boolean;
  petsAllowed: PetsAllowed;
  checkInFrom: string;
  checkInUntil: string;
  checkOutFrom: string;
  checkOutUntil: string;
};

export function NewListingWizard({
  listingId,
  initial,
}: {
  // When editing an existing listing, pass its id (routes the submit to
  // updateListing instead of submitListing) and its current values.
  listingId?: string;
  initial?: NewListingWizardInitial;
}) {
  const editing = Boolean(listingId);
  const action = listingId ? updateListing.bind(null, listingId) : submitListing;
  const [state, formAction] = useFormState(action, initialState);
  const [step, setStep] = useState<Step>(1);
  const [stepError, setStepError] = useState<string | null>(null);

  const [type, setType] = useState<PropertyType>(initial?.type ?? '');
  const [title, setTitle] = useState(initial?.title ?? '');
  const [location, setLocation] = useState(initial?.location ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [images, setImages] = useState<string[]>(initial?.images ?? []);

  const [priceBase, setPriceBase] = useState(initial?.priceBase ?? '');
  const [maxGuests, setMaxGuests] = useState(initial?.maxGuests ?? '2');
  const [bedrooms, setBedrooms] = useState(initial?.bedrooms ?? '1');
  const [bathrooms, setBathrooms] = useState(initial?.bathrooms ?? '1');
  const [roomCount, setRoomCount] = useState(initial?.roomCount ?? '1');
  const [roomTypes, setRoomTypes] = useState<RoomType[]>(initial?.roomTypes ?? []);
  const [sizeSqm, setSizeSqm] = useState(initial?.sizeSqm ?? '');
  const [amenities, setAmenities] = useState<string[]>(initial?.amenities ?? []);
  const [languages, setLanguages] = useState<string[]>(initial?.languages ?? ['English']);

  const [smokingAllowed, setSmokingAllowed] = useState(initial?.smokingAllowed ?? false);
  const [partiesAllowed, setPartiesAllowed] = useState(initial?.partiesAllowed ?? false);
  const [childrenAllowed, setChildrenAllowed] = useState(initial?.childrenAllowed ?? true);
  const [petsAllowed, setPetsAllowed] = useState<PetsAllowed>(initial?.petsAllowed ?? 'no');
  const [checkInFrom, setCheckInFrom] = useState(initial?.checkInFrom ?? '14:00');
  const [checkInUntil, setCheckInUntil] = useState(initial?.checkInUntil ?? '20:00');
  const [checkOutFrom, setCheckOutFrom] = useState(initial?.checkOutFrom ?? '06:00');
  const [checkOutUntil, setCheckOutUntil] = useState(initial?.checkOutUntil ?? '11:00');

  function toggleFrom(list: string[], setList: (v: string[]) => void, name: string) {
    setList(list.includes(name) ? list.filter((a) => a !== name) : [...list, name]);
  }

  function addRoomType() {
    setRoomTypes((prev) => [...prev, { name: '', price: '', maxGuests: '2', count: '1' }]);
  }

  function updateRoomType(index: number, field: keyof RoomType, value: string) {
    setRoomTypes((prev) => prev.map((rt, i) => (i === index ? { ...rt, [field]: value } : rt)));
  }

  function removeRoomType(index: number) {
    setRoomTypes((prev) => prev.filter((_, i) => i !== index));
  }

  function goToStep2() {
    if (!type) {
      setStepError('Choose a property type.');
      return;
    }
    setStepError(null);
    setStep(2);
  }

  function goToStep3() {
    if (!title.trim() || !location.trim()) {
      setStepError('Enter a property name and location.');
      return;
    }
    setStepError(null);
    setStep(3);
  }

  function goToStep4() {
    const price = Number(priceBase);
    if (!price || price <= 0) {
      setStepError('Enter a nightly price.');
      return;
    }
    setStepError(null);
    setStep(4);
  }

  const payout = priceBase ? Number(priceBase) * (1 - COMMISSION_RATE) : 0;

  return (
    <form action={formAction} className="space-y-5">
      <StepIndicator step={step} />

      <div className={step === 1 ? 'block' : 'hidden'}>
        <h1 className="text-2xl font-bold text-brand-950">What type of property is it?</h1>
        <p className="mt-1 text-sm text-brand-500">Choose the option that best fits your place.</p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <TypeCard icon={Building2} label="Hotel" active={type === 'hotel'} onClick={() => setType('hotel')} />
          <TypeCard
            icon={Home}
            label="Homestay"
            active={type === 'homestay'}
            onClick={() => setType('homestay')}
          />
          <TypeCard icon={Compass} label="Tour" disabled soon />
          <TypeCard icon={Car} label="Transport" disabled soon />
        </div>

        {step === 1 && stepError && <p className="mt-3 text-sm text-red-600">{stepError}</p>}

        <button
          type="button"
          onClick={goToStep2}
          className="mt-6 w-full rounded-xl bg-brand-800 px-4 py-3 font-semibold text-white shadow-soft transition hover:bg-brand-900"
        >
          Continue
        </button>
      </div>

      <div className={step === 2 ? 'block' : 'hidden'}>
        <h1 className="text-2xl font-bold text-brand-950">Tell us about your place</h1>
        <p className="mt-1 text-sm text-brand-500">This is what guests will see first.</p>

        <label className="mt-6 flex flex-col gap-1 text-xs font-medium text-brand-500">
          Property name
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Riverside Serenity Hotel"
            className="rounded-xl border border-brand-950/10 px-3.5 py-2.5 text-sm text-brand-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </label>
        <label className="mt-3 flex flex-col gap-1 text-xs font-medium text-brand-500">
          Location
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Riverside, GMC"
            className="rounded-xl border border-brand-950/10 px-3.5 py-2.5 text-sm text-brand-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </label>
        <label className="mt-3 flex flex-col gap-1 text-xs font-medium text-brand-500">
          Description (optional)
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="A few sentences about your place."
            className="rounded-xl border border-brand-950/10 px-3.5 py-2.5 text-sm text-brand-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </label>

        <div className="mt-4">
          <p className="text-xs font-medium text-brand-500">Photos</p>
          <div className="mt-1.5">
            <PhotoUpload images={images} onChange={setImages} />
          </div>
        </div>

        {step === 2 && stepError && <p className="mt-3 text-sm text-red-600">{stepError}</p>}

        <StepNav onBack={() => setStep(1)} onNext={goToStep3} nextLabel="Next" />
      </div>

      <div className={step === 3 ? 'block' : 'hidden'}>
        <h1 className="text-2xl font-bold text-brand-950">Pricing &amp; details</h1>
        <p className="mt-1 text-sm text-brand-500">You can always adjust this later.</p>

        <label className="mt-6 flex flex-col gap-1 text-xs font-medium text-brand-500">
          Price per night (Nu.)
          <input
            type="number"
            min={1}
            value={priceBase}
            onChange={(e) => setPriceBase(e.target.value)}
            className="rounded-xl border border-brand-950/10 px-3.5 py-2.5 text-sm text-brand-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </label>
        {priceBase && Number(priceBase) > 0 && (
          <p className="mt-1.5 text-xs text-brand-500">
            DheySa takes a {COMMISSION_RATE * 100}% commission per booking — you'd receive{' '}
            <span className="font-semibold text-brand-800">{formatCurrency(payout)}</span> per night.
          </p>
        )}

        <div className="mt-3 grid grid-cols-3 gap-3">
          <label className="flex flex-col gap-1 text-xs font-medium text-brand-500">
            Max guests
            <input
              type="number"
              min={1}
              value={maxGuests}
              onChange={(e) => setMaxGuests(e.target.value)}
              className="rounded-xl border border-brand-950/10 px-3.5 py-2.5 text-sm text-brand-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-brand-500">
            Bedrooms
            <input
              type="number"
              min={0}
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
              className="rounded-xl border border-brand-950/10 px-3.5 py-2.5 text-sm text-brand-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-brand-500">
            Bathrooms
            <input
              type="number"
              min={0}
              value={bathrooms}
              onChange={(e) => setBathrooms(e.target.value)}
              className="rounded-xl border border-brand-950/10 px-3.5 py-2.5 text-sm text-brand-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </label>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          {type === 'hotel' && (
            <label className="flex flex-col gap-1 text-xs font-medium text-brand-500">
              Number of rooms available
              <input
                type="number"
                min={1}
                value={roomCount}
                onChange={(e) => setRoomCount(e.target.value)}
                className="rounded-xl border border-brand-950/10 px-3.5 py-2.5 text-sm text-brand-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </label>
          )}
          <label className="flex flex-col gap-1 text-xs font-medium text-brand-500">
            Size in sqm (optional)
            <input
              type="number"
              min={0}
              value={sizeSqm}
              onChange={(e) => setSizeSqm(e.target.value)}
              className="rounded-xl border border-brand-950/10 px-3.5 py-2.5 text-sm text-brand-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </label>
        </div>

        {type === 'hotel' && (
          <div className="mt-5">
            <p className="text-xs font-medium text-brand-500">Room types (optional)</p>
            <p className="mt-0.5 text-xs text-brand-400">
              Describe the different rooms you offer — guests will see these on your listing.
            </p>
            <div className="mt-2 space-y-3">
              {roomTypes.map((rt, i) => (
                <div key={i} className="rounded-xl border border-brand-950/10 p-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={rt.name}
                      onChange={(e) => updateRoomType(i, 'name', e.target.value)}
                      placeholder="e.g. Deluxe Room"
                      className="flex-1 rounded-lg border border-brand-950/10 px-3 py-2 text-sm text-brand-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                    />
                    <button
                      type="button"
                      onClick={() => removeRoomType(i)}
                      aria-label="Remove room type"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-brand-400 transition hover:bg-brand-50 hover:text-brand-700"
                    >
                      <X size={15} />
                    </button>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    <label className="flex flex-col gap-1 text-[11px] font-medium text-brand-500">
                      Price / night
                      <input
                        type="number"
                        min={1}
                        value={rt.price}
                        onChange={(e) => updateRoomType(i, 'price', e.target.value)}
                        className="rounded-lg border border-brand-950/10 px-2.5 py-2 text-sm text-brand-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-[11px] font-medium text-brand-500">
                      Max guests
                      <input
                        type="number"
                        min={1}
                        value={rt.maxGuests}
                        onChange={(e) => updateRoomType(i, 'maxGuests', e.target.value)}
                        className="rounded-lg border border-brand-950/10 px-2.5 py-2 text-sm text-brand-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-[11px] font-medium text-brand-500">
                      Rooms available
                      <input
                        type="number"
                        min={1}
                        value={rt.count}
                        onChange={(e) => updateRoomType(i, 'count', e.target.value)}
                        className="rounded-lg border border-brand-950/10 px-2.5 py-2 text-sm text-brand-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                      />
                    </label>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addRoomType}
                className="text-sm font-semibold text-brand-700 transition hover:text-brand-900"
              >
                + Add room type
              </button>
            </div>
          </div>
        )}

        <div className="mt-5">
          <p className="text-xs font-medium text-brand-500">Amenities</p>
          <div className="mt-2 space-y-3">
            {AMENITY_GROUPS.map((group) => (
              <div key={group.label}>
                <p className="text-xs font-semibold text-brand-800">{group.label}</p>
                <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                  {group.items.map((amenity) => (
                    <label key={amenity} className="flex items-center gap-2 text-sm text-brand-700">
                      <input
                        type="checkbox"
                        checked={amenities.includes(amenity)}
                        onChange={() => toggleFrom(amenities, setAmenities, amenity)}
                        className="h-4 w-4 rounded border-brand-950/20 text-brand-700 focus:ring-brand-300"
                      />
                      {amenity}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <p className="text-xs font-medium text-brand-500">Languages spoken</p>
          <div className="mt-1.5 grid grid-cols-2 gap-1.5">
            {LANGUAGES.map((language) => (
              <label key={language} className="flex items-center gap-2 text-sm text-brand-700">
                <input
                  type="checkbox"
                  checked={languages.includes(language)}
                  onChange={() => toggleFrom(languages, setLanguages, language)}
                  className="h-4 w-4 rounded border-brand-950/20 text-brand-700 focus:ring-brand-300"
                />
                {language}
              </label>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <p className="text-xs font-medium text-brand-500">House rules</p>
          <div className="mt-1.5 space-y-1.5">
            <label className="flex items-center gap-2 text-sm text-brand-700">
              <input
                type="checkbox"
                checked={smokingAllowed}
                onChange={(e) => setSmokingAllowed(e.target.checked)}
                className="h-4 w-4 rounded border-brand-950/20 text-brand-700 focus:ring-brand-300"
              />
              Smoking allowed
            </label>
            <label className="flex items-center gap-2 text-sm text-brand-700">
              <input
                type="checkbox"
                checked={partiesAllowed}
                onChange={(e) => setPartiesAllowed(e.target.checked)}
                className="h-4 w-4 rounded border-brand-950/20 text-brand-700 focus:ring-brand-300"
              />
              Parties/events allowed
            </label>
            <label className="flex items-center gap-2 text-sm text-brand-700">
              <input
                type="checkbox"
                checked={childrenAllowed}
                onChange={(e) => setChildrenAllowed(e.target.checked)}
                className="h-4 w-4 rounded border-brand-950/20 text-brand-700 focus:ring-brand-300"
              />
              Children allowed
            </label>
          </div>

          <p className="mt-3 text-xs text-brand-500">Do you allow pets?</p>
          <div className="mt-1 flex gap-4">
            {(['yes', 'upon_request', 'no'] as PetsAllowed[]).map((option) => (
              <label key={option} className="flex items-center gap-1.5 text-sm text-brand-700">
                <input
                  type="radio"
                  name="petsAllowedRadio"
                  checked={petsAllowed === option}
                  onChange={() => setPetsAllowed(option)}
                  className="h-4 w-4 border-brand-950/20 text-brand-700 focus:ring-brand-300"
                />
                {option === 'yes' ? 'Yes' : option === 'upon_request' ? 'Upon request' : 'No'}
              </label>
            ))}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-brand-500">Check-in window</p>
              <div className="mt-1 flex items-center gap-1.5">
                <input
                  type="time"
                  value={checkInFrom}
                  onChange={(e) => setCheckInFrom(e.target.value)}
                  className="w-full rounded-xl border border-brand-950/10 px-2.5 py-2 text-sm text-brand-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                />
                <span className="text-xs text-brand-400">to</span>
                <input
                  type="time"
                  value={checkInUntil}
                  onChange={(e) => setCheckInUntil(e.target.value)}
                  className="w-full rounded-xl border border-brand-950/10 px-2.5 py-2 text-sm text-brand-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                />
              </div>
            </div>
            <div>
              <p className="text-xs text-brand-500">Check-out window</p>
              <div className="mt-1 flex items-center gap-1.5">
                <input
                  type="time"
                  value={checkOutFrom}
                  onChange={(e) => setCheckOutFrom(e.target.value)}
                  className="w-full rounded-xl border border-brand-950/10 px-2.5 py-2 text-sm text-brand-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                />
                <span className="text-xs text-brand-400">to</span>
                <input
                  type="time"
                  value={checkOutUntil}
                  onChange={(e) => setCheckOutUntil(e.target.value)}
                  className="w-full rounded-xl border border-brand-950/10 px-2.5 py-2 text-sm text-brand-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                />
              </div>
            </div>
          </div>
        </div>

        {step === 3 && stepError && <p className="mt-3 text-sm text-red-600">{stepError}</p>}

        <StepNav onBack={() => setStep(2)} onNext={goToStep4} nextLabel="Next" />
      </div>

      <div className={step === 4 ? 'block' : 'hidden'}>
        <h1 className="text-2xl font-bold text-brand-950">{editing ? 'Review changes' : 'Review & submit'}</h1>
        <p className="mt-1 text-sm text-brand-500">Make sure everything looks right.</p>

        <dl className="mt-6 space-y-2.5 rounded-2xl bg-brand-50 p-4 text-sm">
          <SummaryRow label="Type" value={type === 'hotel' ? 'Hotel' : type === 'homestay' ? 'Homestay' : '—'} />
          <SummaryRow label="Name" value={title || '—'} />
          <SummaryRow label="Location" value={location || '—'} />
          <SummaryRow
            label="Price"
            value={
              priceBase
                ? `${formatCurrency(Number(priceBase))} / night (you keep ${formatCurrency(payout)})`
                : '—'
            }
          />
          <SummaryRow label="Guests" value={maxGuests || '—'} />
          <SummaryRow label="Photos" value={images.length ? `${images.length} added` : 'None added'} />
          {type === 'hotel' && (
            <SummaryRow
              label="Room types"
              value={
                roomTypes.filter((rt) => rt.name.trim()).length
                  ? `${roomTypes.filter((rt) => rt.name.trim()).length} added`
                  : 'None added'
              }
            />
          )}
          <SummaryRow label="Languages" value={languages.length ? languages.join(', ') : '—'} />
          <SummaryRow label="Amenities" value={amenities.length ? amenities.join(', ') : 'None selected'} />
        </dl>

        {state.error && <p className="mt-3 text-sm text-red-600">{state.error}</p>}

        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setStep(3)}
            className="text-sm font-semibold text-brand-600 transition hover:text-brand-900"
          >
            Back
          </button>
          <SubmitButton editing={editing} />
        </div>
        <p className="mt-4 text-center text-xs text-brand-400">
          {editing
            ? 'Changes are saved immediately — a published listing stays published.'
            : 'This submits your listing for review — it won’t be visible to guests until our team approves it.'}
        </p>
      </div>

      {/* Hidden fields so the earlier steps' values travel with the final submit. */}
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="title" value={title} />
      <input type="hidden" name="location" value={location} />
      <input type="hidden" name="description" value={description} />
      <input type="hidden" name="priceBase" value={priceBase} />
      <input type="hidden" name="maxGuests" value={maxGuests} />
      <input type="hidden" name="bedrooms" value={bedrooms} />
      <input type="hidden" name="bathrooms" value={bathrooms} />
      <input type="hidden" name="roomCount" value={roomCount} />
      <input
        type="hidden"
        name="roomTypes"
        value={JSON.stringify(roomTypes.filter((rt) => rt.name.trim()))}
      />
      <input type="hidden" name="sizeSqm" value={sizeSqm} />
      <input type="hidden" name="smokingAllowed" value={String(smokingAllowed)} />
      <input type="hidden" name="partiesAllowed" value={String(partiesAllowed)} />
      <input type="hidden" name="childrenAllowed" value={String(childrenAllowed)} />
      <input type="hidden" name="petsAllowed" value={petsAllowed} />
      <input type="hidden" name="checkInFrom" value={checkInFrom} />
      <input type="hidden" name="checkInUntil" value={checkInUntil} />
      <input type="hidden" name="checkOutFrom" value={checkOutFrom} />
      <input type="hidden" name="checkOutUntil" value={checkOutUntil} />
      {amenities.map((amenity) => (
        <input key={amenity} type="hidden" name="amenities" value={amenity} />
      ))}
      {languages.map((language) => (
        <input key={language} type="hidden" name="languages" value={language} />
      ))}
      {images.map((url) => (
        <input key={url} type="hidden" name="images" value={url} />
      ))}
    </form>
  );
}

function SubmitButton({ editing }: { editing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex-1 rounded-xl bg-accent-500 px-4 py-3 font-bold text-brand-950 shadow-soft transition hover:bg-accent-400 disabled:bg-accent-200"
    >
      {pending ? 'Saving…' : editing ? 'Save changes' : 'Submit for review'}
    </button>
  );
}

function StepIndicator({ step }: { step: Step }) {
  return (
    <div className="flex items-center gap-1.5" aria-hidden="true">
      {[1, 2, 3, 4].map((n) => (
        <span
          key={n}
          className={`h-1.5 flex-1 rounded-full transition-colors ${n <= step ? 'bg-brand-800' : 'bg-brand-100'}`}
        />
      ))}
    </div>
  );
}

function StepNav({
  onBack,
  onNext,
  nextLabel,
}: {
  onBack: () => void;
  onNext: () => void;
  nextLabel: string;
}) {
  return (
    <div className="mt-6 flex items-center gap-3">
      <button
        type="button"
        onClick={onBack}
        className="text-sm font-semibold text-brand-600 transition hover:text-brand-900"
      >
        Back
      </button>
      <button
        type="button"
        onClick={onNext}
        className="flex-1 rounded-xl bg-brand-800 px-4 py-3 font-semibold text-white shadow-soft transition hover:bg-brand-900"
      >
        {nextLabel}
      </button>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-brand-500">{label}</dt>
      <dd className="text-right font-medium text-brand-950">{value}</dd>
    </div>
  );
}

function TypeCard({
  icon: Icon,
  label,
  active,
  disabled,
  soon,
  onClick,
}: {
  icon: typeof Building2;
  label: string;
  active?: boolean;
  disabled?: boolean;
  soon?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`relative flex flex-col items-center gap-2 rounded-2xl border px-4 py-5 text-sm font-semibold transition ${
        disabled
          ? 'cursor-not-allowed border-brand-950/5 text-brand-300'
          : active
            ? 'border-brand-700 bg-brand-50 text-brand-900'
            : 'border-brand-950/10 text-brand-600 hover:border-brand-300'
      }`}
    >
      <Icon size={22} />
      {label}
      {soon && (
        <span className="absolute right-2 top-2 rounded-full bg-black/5 px-1.5 py-0.5 text-[10px] font-medium normal-case tracking-normal text-brand-400">
          Soon
        </span>
      )}
    </button>
  );
}
