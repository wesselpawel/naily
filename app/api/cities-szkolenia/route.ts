import { NextResponse } from "next/server";
import { getCitiesData } from "@/utils/buildCities";

export const dynamic = "force-dynamic";

export async function GET() {
  const cities = getCitiesData();
  // Filter out villages, only return cities
  const citiesOnly = cities.filter((city) => city.type === "city");
  return NextResponse.json(citiesOnly);
}




















