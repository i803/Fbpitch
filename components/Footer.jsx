import { Shirt, Globe, Clock } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-16 text-center text-gray-700 dark:text-gray-400 text-sm px-4">
  <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap justify-center mb-2">
    <div className="flex items-center gap-2">
      <Shirt size={18} className="text-indigo-600 dark:text-indigo-400" /> Retro & Current Kits
    </div>
    <div className="flex items-center gap-2">
      <Globe size={18} className="text-indigo-600 dark:text-indigo-400" /> Shipping Within Kuwait Only
    </div>
    <div className="flex items-center gap-2">
      <Clock size={18} className="text-indigo-600 dark:text-indigo-400" /> Fast Delivery
    </div>
  </div>
  <p className="text-xs text-gray-500 dark:text-gray-500">&copy; 2025 Fbpitch. All rights reserved.</p>
</footer>

  );
}
