import React from "react";
import { useState, useEffect } from 'react';
import { Room, Reservation } from './types/hotel';
import { RoomCard } from './components/RoomCard';
import { BookingModal } from './components/BookingModal';
import { ReservationsList } from './components/ReservationsList';
import { DashboardStats } from './components/DashboardStats';
import { BookingConfirmation } from './components/BookingConfirmation';
import { AdvancedFilters, FilterOptions } from './components/AdvancedFilters';
import { AuthContainer } from './components/auth/AuthContainer';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Card, CardContent } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { 
  Hotel, 
  Search, 
  Calendar, 
  Star,
  MapPin,
  Phone,
  Mail,
  Menu,
  X,
  LogOut,
  User,
  Facebook,
  Instagram,
  Twitter
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { getSupabaseClient } from './utils/supabase/client';

// REVISI: Koneksi dinamis ke Backend Golang
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

export default function App() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [confirmedReservation, setConfirmedReservation] = useState<Reservation | null>(null);
  const [confirmedRoom, setConfirmedRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [filters, setFilters] = useState<FilterOptions>({
    priceRange: [0, 10000000],
    capacity: 1,
    amenities: [],
    availableOnly: false
  });

  useEffect(() => {
    checkSession();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchRooms();
      fetchReservations();
    }
  }, [isAuthenticated]);

  const checkSession = async () => {
    try {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUserEmail(session.user.email || '');
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error checking session:', error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await fetch(`${API_URL}/rooms`);
      const data = await response.json();
      setRooms(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast.error('Gagal memuat data kamar');
    }
  };

  const fetchReservations = async () => {
    try {
      const response = await fetch(`${API_URL}/reservations`);
      const data = await response.json();
      setReservations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      toast.error('Gagal memuat reservasi');
    }
  };

  const handleBookingSuccess = (reservation: Reservation, room: Room) => {
    setConfirmedReservation(reservation);
    setConfirmedRoom(room);
    setConfirmationModalOpen(true);
    fetchRooms();
    fetchReservations();
  };

  const handleLogout = async () => {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    toast.success('Berhasil logout');
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          room.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || room.type === filterType;
    return matchesSearch && matchesType;
  });

  const roomTypes = ['all', 'Deluxe', 'Suite', 'Executive', 'Standard', 'Penthouse'];
  const allAmenities = Array.from(new Set(rooms.flatMap(r => r.amenities || [])));

  if (!isAuthenticated) return <AuthContainer onLoginSuccess={() => setIsAuthenticated(true)} />;

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      <Toaster position="top-right" richColors />
      
      {/* 1. NAVBAR STANDAR PUTIH */}
      <header className="border-b bg-white h-20 flex items-center sticky top-0 z-50">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Hotel className="w-8 h-8 text-black" />
            <div>
              <h1 className="text-xl font-bold leading-none">Grand Hotel Resort</h1>
              <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest">Reservasi Hotel Terbaik</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden sm:block text-right">
              <p className="text-[10px] text-gray-400 uppercase font-bold">Akun Anda</p>
              <p className="text-sm font-semibold">{userEmail}</p>
            </div>
            <Button variant="outline" onClick={handleLogout} className="rounded-xl border-gray-200 hover:bg-red-50 hover:text-red-600 transition-all">
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative h-[480px] flex items-center justify-center text-white">
        <div className="absolute inset-0 bg-black/50 z-10" />
        <img 
          src="https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070" 
          className="absolute inset-0 w-full h-full object-cover" 
          alt="Luxury Hotel"
        />
        <div className="relative z-20 text-center space-y-6 px-4 max-w-4xl">
          <h2 className="text-5xl md:text-7xl font-extrabold tracking-tight">Selamat Datang di Grand Hotel</h2>
          <p className="text-lg md:text-2xl text-gray-200 font-light max-w-2xl mx-auto">Nikmati pengalaman menginap terbaik dengan fasilitas mewah bintang lima</p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Badge className="bg-white/10 hover:bg-white/20 backdrop-blur-md px-5 py-2.5 text-white border-white/20 rounded-full font-medium">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-2" /> Rating 5.0
            </Badge>
            <Badge className="bg-white/10 hover:bg-white/20 backdrop-blur-md px-5 py-2.5 text-white border-white/20 rounded-full font-medium">
              <MapPin className="w-4 h-4 mr-2" /> Jakarta, Indonesia
            </Badge>
          </div>
        </div>
      </section>

      {/* 3. MAIN CONTENT */}
      <main className="flex-grow container mx-auto px-6 py-12">
        <Tabs defaultValue="rooms" className="space-y-12">
          <div className="flex justify-center">
            <TabsList className="bg-gray-100 p-1.5 rounded-full h-16 w-full max-w-md border border-gray-200">
              <TabsTrigger value="rooms" className="rounded-full text-lg font-semibold data-[state=active]:bg-black data-[state=active]:text-white transition-all">Daftar Kamar</TabsTrigger>
              <TabsTrigger value="reservations" className="rounded-full text-lg font-semibold data-[state=active]:bg-black data-[state=active]:text-white transition-all">Reservasi Saya</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="rooms" className="space-y-16">
            <DashboardStats />

            <div className="max-w-6xl mx-auto">
              <Card className="shadow-xl shadow-gray-200/50 border-none rounded-[32px] bg-white overflow-hidden">
                <CardContent className="p-10 space-y-8">
                  <div className="flex flex-col md:row gap-6 items-center">
                    <div className="relative flex-grow w-full">
                      <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input 
                        placeholder="Cari nama atau tipe kamar..." 
                        value={searchQuery} 
                        onChange={(e) => setSearchQuery(e.target.value)} 
                        className="h-16 pl-14 pr-6 text-lg bg-gray-50 border-gray-100 rounded-2xl focus:ring-black focus:border-black transition-all"
                      />
                    </div>
                    <AdvancedFilters filters={filters} onFiltersChange={setFilters} allAmenities={allAmenities} />
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    {roomTypes.map(type => (
                      <Badge 
                        key={type} 
                        variant={filterType === type ? "default" : "outline"} 
                        className={`cursor-pointer px-7 py-3 text-sm rounded-full font-bold transition-all border-gray-200 ${
                          filterType === type 
                          ? 'bg-black text-white hover:bg-black/90' 
                          : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                        onClick={() => setFilterType(type)}
                      >
                        {type === 'all' ? 'Semua Tipe' : type}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {filteredRooms.map(room => (
                <RoomCard key={room.id} room={room} onBook={(r) => { setSelectedRoom(r); setBookingModalOpen(true); }} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reservations">
            <ReservationsList reservations={reservations} rooms={rooms} onUpdate={fetchReservations} />
          </TabsContent>
        </Tabs>
      </main>

      {/* 4. HUBUNGI KAMI */}
      <section className="bg-gray-50 py-24 border-t border-gray-100">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-extrabold text-gray-900">Hubungi Kami</h3>
            <p className="text-gray-500 font-medium">Layanan bantuan reservasi tersedia 24/7</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="text-center p-12 rounded-[40px] border-none bg-white shadow-sm hover:shadow-md transition-all">
              <Phone className="w-10 h-10 mx-auto mb-6 text-blue-600" />
              <h4 className="text-2xl font-bold mb-3">Telepon</h4>
              <p className="text-gray-600">+62 21 1234 5678</p>
            </Card>
            <Card className="text-center p-12 rounded-[40px] border-none bg-white shadow-sm hover:shadow-md transition-all">
              <Mail className="w-10 h-10 mx-auto mb-6 text-red-600" />
              <h4 className="text-2xl font-bold mb-3">Email</h4>
              <p className="text-gray-600">info@grandhotel.com</p>
            </Card>
            <Card className="text-center p-12 rounded-[40px] border-none bg-white shadow-sm hover:shadow-md transition-all">
              <MapPin className="w-10 h-10 mx-auto mb-6 text-green-600" />
              <h4 className="text-2xl font-bold mb-3">Alamat</h4>
              <p className="text-gray-600">Jl. Sudirman No. 123, Jakarta</p>
            </Card>
          </div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="bg-white py-12 border-t border-gray-100 text-center">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-8 text-sm text-gray-500">
            <p className="max-w-xs text-center md:text-left leading-relaxed">
              Pengalaman menginap mewah dengan layanan backend Golang yang super cepat.
            </p>
            <div className="flex gap-10 font-bold text-gray-900">
              <button className="hover:text-black">Tentang Kami</button>
              <button className="hover:text-black">Pusat Bantuan</button>
            </div>
            <div className="flex gap-6">
              <Facebook className="w-5 h-5 cursor-pointer hover:text-black" />
              <Instagram className="w-5 h-5 cursor-pointer hover:text-black" />
              <Twitter className="w-5 h-5 cursor-pointer hover:text-black" />
            </div>
          </div>
          <div className="pt-8 border-t border-gray-50">
            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">
              © 2026 Grand Hotel Go - Powered by Golang & React.
            </p>
          </div>
        </div>
      </footer>

      <BookingModal room={selectedRoom} open={bookingModalOpen} onClose={() => setBookingModalOpen(false)} onSuccess={handleBookingSuccess} />
      <BookingConfirmation reservation={confirmedReservation} room={confirmedRoom} open={confirmationModalOpen} onClose={() => setConfirmationModalOpen(false)} />
    </div>
  );
}