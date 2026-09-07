import React from "react";
import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <ShieldAlert size={40} className="text-ink-500 mb-4" />
      <h1 className="text-xl font-semibold text-ink-100 mb-2">Page not found</h1>
      <p className="text-sm text-ink-500 mb-6">The page you're looking for doesn't exist.</p>
      <Link to="/" className="text-sm text-volt-400 hover:text-volt-500">
        Back to Dashboard
      </Link>
    </div>
  );
}
