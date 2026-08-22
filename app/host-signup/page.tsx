import { HostSignupForm } from '@/components/host-signup-form';
import { Reveal } from '@/components/motion/reveal';

export default function HostSignupPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-64px)] max-w-sm items-center px-6 py-16">
      <Reveal className="w-full">
        <div className="rounded-3xl border border-brand-950/5 p-8 shadow-soft">
          <HostSignupForm />
        </div>
      </Reveal>
    </main>
  );
}
