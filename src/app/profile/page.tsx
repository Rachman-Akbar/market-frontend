"use client";
import { useAuth } from "@/lib/store/authContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <p className="text-gray-500 mb-4">Silakan masuk untuk melihat profil</p>
        <Link href="/auth/login"><Button>Masuk</Button></Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
      <h2 className="font-bold text-gray-800 text-lg">Akun Saya</h2>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Nama Lengkap</label>
          <Input defaultValue={user.name} readOnly className="bg-gray-50" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
          <Input defaultValue={user.email} readOnly className="bg-gray-50" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Role</label>
          <Input defaultValue={user.role} readOnly className="bg-gray-50 capitalize" />
        </div>
      </div>
      <Button
        variant="destructive"
        onClick={() => { logout(); router.push("/"); }}
        className="mt-2 bg-red-500 hover:bg-red-600 text-white"
      >
        Keluar
      </Button>
    </div>
  );
}
