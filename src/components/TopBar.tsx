"use client";

import { Bell, CreditCard, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function TopBar() {
  return (
    <header className="h-14 shrink-0 bg-white border-b border-gray-100 flex items-center justify-end px-6 gap-4">
      {/* Credit */}
      <div className="flex items-center gap-1.5 text-[13px] text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
        <CreditCard size={14} className="text-brand" />
        <span>Credit :</span>
        <span className="font-semibold text-gray-900">3232</span>
      </div>

      {/* Currency selector */}
      <Button
        variant="outline"
        size="sm"
        className="h-8 text-[13px] text-gray-600 border-gray-200 gap-1 px-3"
      >
        USD ($)
        <ChevronDown size={13} className="text-gray-400" />
      </Button>

      {/* Notifications */}
      <div className="relative">
        <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
          <Bell size={16} className="text-gray-500" />
        </button>
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold">
          2
        </span>
      </div>

      {/* User */}
      <div className="flex items-center gap-2 cursor-pointer">
        <Avatar className="w-8 h-8">
          <AvatarImage src="" />
          <AvatarFallback className="text-[11px] font-semibold bg-indigo-100 text-indigo-700">
            WM
          </AvatarFallback>
        </Avatar>
        <span className="text-[13px] font-medium text-gray-800">Wollin Mori</span>
      </div>
    </header>
  );
}
