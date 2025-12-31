"use client";

import { useState } from "react";
import { Car, MapPin, Clock } from "lucide-react";

export default function WasherDashboard() {
  const [selectedCar, setSelectedCar] = useState<string | null>(null);
  const [acceptedCars, setAcceptedCars] = useState<Set<string>>(new Set());
  const [finishedCars, setFinishedCars] = useState<Set<string>>(new Set());

  const cars = [
    { id: "EP-1023", location: "Colombo 07", time: "10:30 AM", type: "Sedan" },
    { id: "EP-1041", location: "Colombo 03", time: "11:15 AM", type: "SUV" },
    { id: "EP-1088", location: "Malabe", time: "12:00 PM", type: "Hatchback" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b1220] to-[#05080f] text-white">
      {/* Header */}
      <header className="flex justify-between items-center px-10 py-6 border-b border-white/10">
        <h1 className="text-xl font-bold text-lime-400">EasyPark</h1>
        <span className="text-sm text-white/70">Washer Dashboard</span>
      </header>

      {/* Page Title */}
      <section className="text-center mt-14">
        <h2 className="text-4xl font-bold">Available Cars for Wash</h2>
        <p className="text-white/60 mt-3">
          View parked cars, accept a job, and confirm once washing is completed.
        </p>
      </section>

      {/* Cars Grid */}
      <section className="max-w-6xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 px-6">
        {cars.map((car) => (
          <div
            key={car.id}
            className={`rounded-2xl bg-white/5 border border-white/10 p-6 backdrop-blur transition ${
              selectedCar === car.id ? "ring-2 ring-lime-400" : "hover:bg-white/10"
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              <Car className="text-lime-400" />
              <h3 className="font-semibold text-lg">Car #{car.id}</h3>
            </div>

            <div className="space-y-2 text-sm text-white/70">
              <p className="flex items-center gap-2"><MapPin size={16} /> {car.location}</p>
              <p className="flex items-center gap-2"><Clock size={16} /> {car.time}</p>
              <p>Type: {car.type}</p>
            </div>

            <button
              onClick={() => {
              setSelectedCar(car.id);
              if (acceptedCars.has(car.id)) {
                setFinishedCars(prev => new Set(prev).add(car.id));
              } else {
                setAcceptedCars(prev => new Set(prev).add(car.id));
              }
            }}
              className="mt-6 w-full py-2 rounded-xl bg-lime-500 text-black font-semibold hover:bg-lime-400"
            >
              {finishedCars.has(car.id) ? "Finished" : acceptedCars.has(car.id) ? "Done" : "Accept for Washing"}
            </button>
          </div>
        ))}
      </section>

      
      {/* Footer spacing */}
      <div className="h-24"></div>
    </div>
  );
}
