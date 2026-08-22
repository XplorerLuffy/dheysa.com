'use client';

import { useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Building2, Home, Compass, Car } from 'lucide-react';
import { submitListing, type ListingFormState } from '@/app/actions/listings';
import { formatCurrency } from '@/lib/format';

const initialState: ListingFormState = { error: null };

const AMENITIES = ['WiFi', 'Breakfast included', 'Free parking', 'Air conditioning', 'Hot water', 'Mountain view'];

type Step = 1 | 2 | 3 | 4;
type PropertyType = 'hotel' | 'homestay' | '';

export function NewListingWizard() {
  const [state, formAction] = useFormState(submitListing, initialState);
  const [step, setStep] = useState<Step>(1);
  const [stepError, setStepError] = useState<string | null>(null);

  const [type, setType] = useState<PropertyType>('');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [priceBase, setPriceBase] = useState('');
  const [maxGuests, setMaxGuests] = useState('2');
  const [bedrooms, setBedrooms] = useState('1');
  const [bathrooms, setBathrooms] = useState('1');
  const [roomCount, setRoomCount] = useState('1');
  const [amenities, setAmenities] = useState<string[]>([]);

  function toggleAmenity(name: string) {
    setAmenities((prev) => (prev.includes(name) ? prev.filter((a) => a !== name) : [...prev, name]));
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

        {type === 'hotel' && (
          <label className="mt-3 flex flex-col gap-1 text-xs font-medium text-brand-500">
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

        <div className="mt-4">
          <p className="text-xs font-medium text-brand-500">Amenities</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {AMENITIES.map((amenity) => (
              <label key={amenity} className="flex items-center gap-2 text-sm text-brand-700">
                <input
                  type="checkbox"
                  checked={amenities.includes(amenity)}
                  onChange={() => toggleAmenity(amenity)}
                  className="h-4 w-4 rounded border-brand-950/20 text-brand-700 focus:ring-brand-300"
                />
                {amenity}
              </label>
            ))}
          </div>
        </div>

        {step === 3 && stepError && <p className="mt-3 text-sm text-red-600">{stepError}</p>}

        <StepNav onBack={() => setStep(2)} onNext={goToStep4} nextLabel="Next" />
      </div>

      <div className={step === 4 ? 'block' : 'hidden'}>
        <h1 className="text-2xl font-bold text-brand-950">Review &amp; submit</h1>
        <p className="mt-1 text-sm text-brand-500">Make sure everything looks right.</p>

        <dl className="mt-6 space-y-2.5 rounded-2xl bg-brand-50 p-4 text-sm">
          <SummaryRow label="Type" value={type === 'hotel' ? 'Hotel' : type === 'homestay' ? 'Homestay' : '—'} />
          <SummaryRow label="Name" value={title || '—'} />
          <SummaryRow label="Location" value={location || '—'} />
          <SummaryRow
            label="Price"
            value={priceBase ? `${formatCurrency(Number(priceBase))} / night` : '—'}
          />
          <SummaryRow label="Guests" value={maxGuests || '—'} />
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
          <SubmitButton />
        </div>
        <p className="mt-4 text-center text-xs text-brand-400">
          This submits your listing for review — it won’t be visible to guests until our team approves it.
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
      {amenities.map((amenity) => (
        <input key={amenity} type="hidden" name="amenities" value={amenity} />
      ))}
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex-1 rounded-xl bg-accent-500 px-4 py-3 font-bold text-brand-950 shadow-soft transition hover:bg-accent-400 disabled:bg-accent-200"
    >
      {pending ? 'Submitting…' : 'Submit for review'}
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
