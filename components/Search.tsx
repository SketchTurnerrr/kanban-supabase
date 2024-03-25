'use client';
import { SearchIcon } from 'lucide-react';
import { Input } from './ui/input';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';

export function Search() {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const { replace } = useRouter();

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set('query', term);
    } else {
      params.delete('query');
    }
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  return (
    <div className="relative  flex gap-2 items-center">
      <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
      <Input
        onChange={(e) => {
          handleSearch(e.target.value);
        }}
        defaultValue={searchParams.get('query')?.toString()}
        spellCheck="false"
        className=" w-full pl-8 h-9 dark:placeholder-gray-400"
        placeholder="Search boards..."
        type="search"
      />
    </div>
  );
}
