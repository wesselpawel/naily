import { User } from "@/types";
import { IService } from "@/types";
import UserCard from "@/components/CityPage/UserCard";
import { ICity } from "@/types";

interface ServicesGridSectionProps {
  users: User[];
  cityParam: string;
  title: string;
  sliceStart?: number;
  sliceEnd?: number;
}

export default function ServicesGridSection({
  users,
  cityParam,
  title,
  sliceStart = 0,
  sliceEnd,
}: ServicesGridSectionProps) {
  const displayedUsers = sliceEnd
    ? users.slice(sliceStart, sliceEnd)
    : users.slice(sliceStart);

  if (displayedUsers.length === 0) {
    return null;
  }

  return (
    <section className="py-20 px-6 bg-white">
      <div className="container">
        <h2 className="mb-12 text-3xl lg:text-4xl font-baloo font-bold text-neutral-900">
          {title}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:gap-8">
          {displayedUsers.map((u: User) => (
            <UserCard key={u.uid} user={u} cityParam={cityParam} />
          ))}
        </div>
      </div>
    </section>
  );
}








