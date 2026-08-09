import { Link } from "wouter";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <div className="bg-white p-12 rounded-3xl shadow-xl text-center border-2 border-border max-w-md mx-4">
        <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-display text-foreground mb-4">Ups!</h1>
        <p className="text-muted-foreground mb-8">
          Vi kunne ikke finde den side du leder efter. Måske har en drilsk nisse flyttet den?
        </p>

        <Link href="/" className="block w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-opacity">
          Gå tilbage til forsiden
        </Link>
      </div>
    </div>
  );
}
