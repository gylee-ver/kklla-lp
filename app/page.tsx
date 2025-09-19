import MobileFrame from "@/components/MobileFrame";
import Image from "next/image";

export default function Home() {
  return (
    <MobileFrame>
      <div className="w-full h-full relative">
        <Image
          src="/next.svg"
          alt="Hero"
          width={180}
          height={38}
          className="absolute left-1/2 -translate-x-1/2 top-8 dark:invert"
          priority
        />
        <div className="absolute bottom-6 left-4 right-4">
          <a
            href="#cta"
            className="block w-full text-center rounded-xl bg-black text-white py-4 text-base font-semibold dark:bg-white dark:text-black"
          >
            지금 문의하기
          </a>
        </div>
      </div>
    </MobileFrame>
  );
}
