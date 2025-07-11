"use client";
import { useEffect, useState } from 'react';
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

// Dummy data for current attendance room and session
const currentRoom = {
  id: 'room1',
  name: 'Web Development',
  status: 'open',
};

const currentSession = {
  id: 'session1',
  name: 'Week 5: React Components',
  time: 'July 11, 2025, 10:00 AM - 11:30 AM',
  status: 'ongoing',
};

export default function AttendancePage() {
    const router = useRouter();
    const validateDeviceAuthorization = async (imageData: string) => {
      try {
        const response = await fetch(imageData);
        const blob = await response.blob();
        const file = new File([blob], "env.png", {type: blob.type});
        if (!file) return;
        const formData = new FormData();
        formData.append('image', file);
        const res = await fetch('/api/device/validate', {
          method: 'POST',
          body: formData,
        });
        if (!res.ok) throw new Error('Validation failed');
        const data = await res.json();
        if (data.valid) {
          return true;
        } else {
          return false;
        }
      } catch (error) {
        alert('Failed to validate device.');
      }
  };

  useEffect(() => { 
    fetch('/api/device/authorize')
    .then(res => res.json())
    .then(json => {
      console.log(json.image);
      return validateDeviceAuthorization(json.image);
    }).then(isValid => {
      if(!isValid){
        router.push("/dashboard");
      }
    });
  });
  
  const handleTakeAttendance = async () => {
    try {
      if (!navigator.bluetooth) {
        return;
      }
      if (!navigator.bluetooth.getAvailability()) {
        return;
      }

      const SERVICE_UUID = "5c339364-c7be-4f23-b666-a8ff73a6a86a";
      const CHARACTERISTIC_UUID = "bfc0c92f-317d-4ba9-976b-cc11ce77b4ca";

      const device = await navigator.bluetooth.requestDevice({ filters: [{ services: ["5c339364-c7be-4f23-b666-a8ff73a6a86a"] }] });
      const server = await device.gatt?.connect();
      const service = await server?.getPrimaryService(SERVICE_UUID);   
      const characteristic = await service?.getCharacteristic(CHARACTERISTIC_UUID);        
      const value = await characteristic?.readValue();
      const serve1 = device.gatt?.disconnect();
      const serve2 = device.forget();

      const decoder = new TextDecoder("utf-8");
      const uuid = decoder.decode(value);

      // Send UUID and session info to backend to mark attendance
      const res = await fetch('/api/attendance/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uuid, sessionId: currentSession.id }),
      });
      if (!res.ok) throw new Error('Attendance marking failed');
      const data = await res.json();
      if (data.success) {
        alert('Attendance marked successfully!');
      } else {
        alert('Attendance marking failed.');
      }

      await serve1;
      await serve2;
    } catch (error) {
      console.log(error)
      alert('Bluetooth attendance failed.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      {/* Header Section */}
      <div className="flex items-center gap-3 mb-8">
        <CheckCircleIcon className="h-10 w-10 text-blue-500" />
        <h1 className="text-3xl font-extrabold text-neutral-100 tracking-tight">Attendance Room</h1>
      </div>

      {/* Room Info Card */}
      <div className="bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 border border-neutral-800 rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-neutral-100">{currentRoom.name}</h2>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${currentRoom.status === 'open' ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}>{currentRoom.status.toUpperCase()}</span>
        </div>
        <p className="text-neutral-400 text-sm">Room ID: <span className="font-mono text-neutral-300">{currentRoom.id}</span></p>
      </div>

      {/* Session Info Card */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-block w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          <h3 className="text-lg font-semibold text-neutral-200">Session Info</h3>
        </div>
        <p className="text-neutral-300 font-medium mb-1">{currentSession.name}</p>
        <p className="text-neutral-400 mb-1">{currentSession.time}</p>
        <p className="text-neutral-400">Session Status: <span className={currentSession.status === 'ongoing' ? 'text-blue-400 font-bold' : 'text-yellow-400'}>{currentSession.status}</span></p>
      </div>

      {/* Take Attendance Button */}
      <button
        onClick={handleTakeAttendance}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
      >
        <CheckCircleIcon className="h-6 w-6 text-white animate-bounce" />
        Take Attendance
      </button>
    </div>
  );
}
