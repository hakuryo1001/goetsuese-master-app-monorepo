"use client";

import Link from "next/link";
import { IoIosInformationCircle } from "react-icons/io";
import { FaReddit } from "react-icons/fa";

import { links } from "./links";

const iconClass = "h-5 w-5 fill-white transition hover:fill-neutral-300";

export default function Navbar() {
  return (
    <footer className="bg-black p-4 sm:p-6">
      <div className="md:flex md:justify-between">
        <div className="mb-6 md:mb-0">
          <div className="m-4">
            <Link href="/" className="flex place-items-center">
              <div className="grid grid-cols-1 align-middle">
                <div className="m-4 text-xl font-semibold whitespace-nowrap text-white">
                  Cantonese Jyutcitzi Converter | 漢字粵切字轉換器 ｜ 
                </div>
              </div>
            </Link>
          </div>
        </div>
        <div className="flex items-center justify-between sm:mt-0">
          <div className="mt-4 flex space-x-6 sm:mt-0 sm:justify-center">
            <Link
              href={links.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-500 hover:text-white"
              aria-label="Twitter"
            >
              <svg className={iconClass} viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </Link>
            <Link
              href={links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-500 hover:text-white"
              aria-label="GitHub"
            >
              <svg className={iconClass} viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
            <Link
              href={links.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-500 hover:text-white"
              aria-label="Telegram"
            >
              <svg className={iconClass} viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M22.05 1.577c-.393-.016-.784.08-1.117.235-.484.186-4.92 1.902-9.41 3.64-2.26.873-4.518 1.746-6.256 2.415-1.737.67-3.045 1.168-3.114 1.192-.46.16-1.082.362-1.61.984-.133.155-.267.354-.335.628s-.038.622.095.895c.265.547.714.773 1.244.976 1.76.564 3.58 1.102 5.087 1.608.556 1.96 1.09 3.927 1.618 5.89.174.394.553.54.944.544l-.002.02s.307.03.606-.042c.3-.07.677-.244 1.02-.565.377-.354 1.4-1.36 1.98-1.928l4.37 3.226.035.02s.484.34 1.192.388c.354.024.82-.044 1.22-.337.403-.294.67-.767.795-1.307.374-1.63 2.853-13.427 3.276-15.38l-.012.046c.296-1.1.187-2.108-.496-2.705-.342-.297-.736-.427-1.13-.444zm-.118 1.874c.027.025.025.025.002.027-.007-.002.08.118-.09.755l-.007.024-.005.022c-.432 1.997-2.936 13.9-3.27 15.356-.046.196-.065.182-.054.17-.1-.015-.285-.094-.3-.1l-7.48-5.525c2.562-2.467 5.182-4.7 7.827-7.08.468-.235.39-.96-.17-.972-.594.14-1.095.567-1.64.84-3.132 1.858-6.332 3.492-9.43 5.406-1.59-.553-3.177-1.012-4.643-1.467 1.272-.51 2.283-.886 3.278-1.27 1.738-.67 3.996-1.54 6.256-2.415 4.522-1.748 9.07-3.51 9.465-3.662l.032-.013.03-.013c.11-.05.173-.055.202-.057 0 0-.01-.033-.002-.026zM10.02 16.016l1.234.912c-.532.52-1.035 1.01-1.398 1.36z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
            <Link
              href={links.information}
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-500 hover:text-white"
              aria-label="Jyutcitzi information"
            >
              <IoIosInformationCircle className={iconClass} />
            </Link>
            <Link
              href={links.reddit}
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-500 hover:text-white"
              aria-label="Reddit"
            >
              <FaReddit className={iconClass} />
            </Link>
          </div>
        </div>
      </div>
      <hr className="border-neutral-800 sm:mx-auto lg:my-8" />
    </footer>
  );
}
