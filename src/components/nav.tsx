import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export function Nav() {
  return (
    <header className='border-b bg-emerald-50'>
      <div className='container flex h-16 items-center px-4'>
        <Link href='/' className='flex items-center space-x-2'>
          <Image src='/logo.svg' alt='EDIFY' width={32} height={32} />
          <span className='text-2xl font-bold'>EDIFY</span>
        </Link>
        <nav className='ml-auto flex gap-4'>
          <Button variant='ghost' asChild>
            <Link href='/tools'>Tools</Link>
          </Button>
          <Button variant='ghost' asChild>
            <Link href='/about'>About</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
