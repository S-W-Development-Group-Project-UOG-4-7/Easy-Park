'use client';

import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import { BookingData } from '../components/BookingForm';

export default function ReportsPage() {
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [loading, setLoading] = useState(true);

  // Load bookings from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedBookings = localStorage.getItem('parkingBookings');
      if (savedBookings) {
        try {
          setBookings(JSON.parse(savedBookings));
        } catch (e) {
          console.error('Error loading bookings:', e);
        }
      }
      setLoading(false);
    }
  }, []);

  // Filter bookings by period
  const getFilteredBookings = () => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return bookings.filter(booking => {
      const bookingDate = new Date(booking.entryTime);
      
      if (selectedPeriod === 'daily') {
        return bookingDate >= startOfDay;
      } else if (selectedPeriod === 'weekly') {
        return bookingDate >= startOfWeek;
      } else {
        return bookingDate >= startOfMonth;
      }
    });
  };

  const filteredBookings = getFilteredBookings();

  // Calculate statistics
  const calculateStats = () => {
    const stats = {
      totalVehicles: filteredBookings.length,
      totalRevenue: filteredBookings.reduce((sum, b) => sum + (b.amount || 0), 0),
      avgStayTime: calculateAvgStayTime(),
      vehicleTypes: getVehicleTypes(),
      peakHours: getPeakHours(),
    };
    return stats;
  };

  const calculateAvgStayTime = () => {
    if (filteredBookings.length === 0) return '0h 0m';
    const totalMinutes = filteredBookings.reduce((sum, b) => {
      const entry = new Date(b.entryTime);
      const exit = new Date(b.expectedExitTime);
      return sum + (exit.getTime() - entry.getTime()) / (1000 * 60);
    }, 0);
    const avgMinutes = Math.round(totalMinutes / filteredBookings.length);
    const hours = Math.floor(avgMinutes / 60);
    const minutes = avgMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  const getVehicleTypes = () => {
    const types: Record<string, number> = {};
    filteredBookings.forEach(b => {
      types[b.vehicleType] = (types[b.vehicleType] || 0) + 1;
    });
    return types;
  };

  const getPeakHours = () => {
    if (filteredBookings.length === 0) return 'N/A';
    const hours: Record<number, number> = {};
    filteredBookings.forEach(b => {
      const hour = new Date(b.entryTime).getHours();
      hours[hour] = (hours[hour] || 0) + 1;
    });
    const peakHour = Object.entries(hours).reduce((a, b) => (b[1] > a[1] ? b : a))[0];
    return `${peakHour}:00 - ${parseInt(peakHour) + 1}:00`;
  };

  const stats = calculateStats();

  // Generate PDF Report
  const generatePDFReport = () => {
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 20;

    // Header
    doc.setFontSize(20);
    doc.text('Easy-Park Parking Report', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    doc.setFontSize(12);
    const periodText = selectedPeriod === 'daily' ? 'Daily' : selectedPeriod === 'weekly' ? 'Weekly' : 'Monthly';
    const now = new Date();
    doc.text(`${periodText} Report - ${now.toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Statistics Section
    doc.setFontSize(14);
    doc.text('Summary Statistics', 20, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    const statsData = [
      [`Total Vehicles: ${stats.totalVehicles}`, `Total Revenue: $${stats.totalRevenue}`],
      [`Average Stay Time: ${stats.avgStayTime}`, `Peak Hours: ${stats.peakHours}`],
    ];

    statsData.forEach(row => {
      doc.text(row[0], 25, yPosition);
      doc.text(row[1], 120, yPosition);
      yPosition += 6;
    });

    yPosition += 5;

    // Vehicle Types
    doc.setFontSize(12);
    doc.text('Vehicle Types Distribution', 20, yPosition);
    yPosition += 7;

    doc.setFontSize(10);
    Object.entries(stats.vehicleTypes).forEach(([type, count]) => {
      doc.text(`${type}: ${count}`, 25, yPosition);
      yPosition += 5;
    });

    yPosition += 8;

    // Detailed Bookings Table
    doc.setFontSize(12);
    doc.text('Detailed Vehicle Records', 20, yPosition);
    yPosition += 8;

    doc.setFontSize(9);
    const tableHeaders = ['Vehicle', 'Driver', 'Slot', 'Entry Time', 'Exit Time', 'Type', 'Amount'];
    const tableData = filteredBookings.map(b => [
      b.vehicleNumber,
      b.driverName,
      b.parkingSpot,
      new Date(b.entryTime).toLocaleString().split(',')[1].trim().substring(0, 8),
      new Date(b.expectedExitTime).toLocaleString().split(',')[1].trim().substring(0, 8),
      b.vehicleType,
      `$${b.amount || 0}`,
    ]);

    // Create table
    let tableYPosition = yPosition;
    const rowHeight = 6;
    const colWidths = [25, 30, 15, 25, 25, 20, 20];

    // Headers
    let xPosition = 15;
    tableHeaders.forEach((header, i) => {
      doc.text(header, xPosition, tableYPosition);
      xPosition += colWidths[i];
    });
    tableYPosition += rowHeight;

    // Data rows
    tableData.forEach(row => {
      if (tableYPosition > pageHeight - 20) {
        doc.addPage();
        tableYPosition = 20;
        // Repeat headers on new page
        xPosition = 15;
        tableHeaders.forEach((header, i) => {
          doc.text(header, xPosition, tableYPosition);
          xPosition += colWidths[i];
        });
        tableYPosition += rowHeight;
      }

      xPosition = 15;
      row.forEach((cell, i) => {
        doc.text(String(cell), xPosition, tableYPosition);
        xPosition += colWidths[i];
      });
      tableYPosition += rowHeight;
    });

    // Footer
    doc.setFontSize(8);
    doc.text(`Generated on ${now.toLocaleString()}`, pageWidth / 2, pageHeight - 10, { align: 'center' });

    // Download
    const fileName = `parking-report-${selectedPeriod}-${now.getTime()}.pdf`;
    doc.save(fileName);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Reports</h1>
        <p className="text-slate-400">Generate and download parking reports</p>
      </div>

      {loading ? (
        <div className="text-center text-slate-400">Loading reports...</div>
      ) : (
        <>
          {/* Period Selection & Download */}
          <div className="bg-slate-800/50 rounded-lg border border-slate-700/50 p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div>
                <label className="text-slate-300 font-semibold mb-3 block">Select Report Period:</label>
                <div className="flex gap-3">
                  {(['daily', 'weekly', 'monthly'] as const).map(period => (
                    <button
                      key={period}
                      onClick={() => setSelectedPeriod(period)}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                        selectedPeriod === period
                          ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-500/30'
                          : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {period.charAt(0).toUpperCase() + period.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={generatePDFReport}
                className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold px-6 py-3 rounded-lg hover:shadow-lg hover:shadow-emerald-500/30 transition-all flex items-center gap-2"
              >
                <span>📥</span>
                Download PDF Report
              </button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { title: 'Total Vehicles', value: stats.totalVehicles, icon: '🚗' },
              { title: 'Total Revenue', value: `$${stats.totalRevenue}`, icon: '💰' },
              { title: 'Avg Stay Time', value: stats.avgStayTime, icon: '⏱️' },
              { title: 'Peak Hours', value: stats.peakHours, icon: '📈' },
            ].map((stat, idx) => (
              <div key={idx} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-sm">{stat.title}</span>
                  <span className="text-xl">{stat.icon}</span>
                </div>
                <div className="text-2xl font-bold text-emerald-400">{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Vehicle Types */}
          {Object.keys(stats.vehicleTypes).length > 0 && (
            <div className="bg-slate-800/50 rounded-lg border border-slate-700/50 p-6 mb-8">
              <h2 className="text-xl font-bold text-white mb-4">Vehicle Types Distribution</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(stats.vehicleTypes).map(([type, count]) => (
                  <div key={type} className="bg-slate-900/50 rounded p-4 border border-slate-700/30">
                    <p className="text-slate-400 text-sm">{type}</p>
                    <p className="text-2xl font-bold text-emerald-400">{count}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Bookings Table */}
          <div className="bg-slate-800/50 rounded-lg border border-slate-700/50 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Detailed Vehicle Records</h2>
            
            {filteredBookings.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <p className="text-lg mb-2">No vehicles found for this period</p>
                <p className="text-sm">Vehicles will appear here once they're booked in the parking system</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4 text-slate-300 font-semibold">Vehicle #</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-semibold">Driver Name</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-semibold">Parking Slot</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-semibold">Entry Time</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-semibold">Exit Time</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-semibold">Vehicle Type</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-semibold">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map((booking, idx) => (
                      <tr key={idx} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors">
                        <td className="py-3 px-4 text-slate-200 font-medium">{booking.vehicleNumber}</td>
                        <td className="py-3 px-4 text-slate-300">{booking.driverName}</td>
                        <td className="py-3 px-4">
                          <span className="bg-emerald-900/20 text-emerald-300 px-2 py-1 rounded text-xs border border-emerald-700/30">
                            {booking.parkingSpot}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-300 text-xs">{new Date(booking.entryTime).toLocaleString()}</td>
                        <td className="py-3 px-4 text-slate-300 text-xs">{new Date(booking.expectedExitTime).toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <span className="bg-slate-900/50 text-slate-300 px-2 py-1 rounded text-xs border border-slate-700">
                            {booking.vehicleType}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-emerald-400 font-semibold">${booking.amount || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}




