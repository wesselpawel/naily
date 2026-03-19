import { NextResponse } from "next/server";
import { db } from "@/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ uid: string }> }
) {
  try {
    const { uid } = await params;
    if (!uid) {
      return NextResponse.json({ error: "Missing uid" }, { status: 400 });
    }

    const colRef = collection(db, "users", uid, "portfolio");
    const q = query(colRef, orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    const portfolio = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    return NextResponse.json(portfolio);
  } catch (error) {
    console.error("Error fetching portfolio:", error);
    return NextResponse.json(
      { error: "Failed to fetch portfolio" },
      { status: 500 }
    );
  }
}






















