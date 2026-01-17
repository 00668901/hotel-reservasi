import { useState, useEffect } from 'react';
import { Room, Reservation } from './types/hotel';
import { RoomCard } from './components/RoomCard';
import { BookingModal } from './components/BookingModal';
import { ReservationsList } from './components/ReservationsList';
import { DashboardStats } from './components/DashboardStats';
import { BookingConfirmation } from './components/BookingConfirmation';
import { AdvancedFilters, FilterOptions } from './components/AdvancedFilters';
import { SetupInstructions } from './components/SetupInstructions';
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
  Users, 
  Star,
  MapPin,
  Phone,
  Mail,
  Menu,
  X,
  BarChart3,
  LogOut,
  User
} from 'lucide-react';
import { toast, Toaster } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from './utils/supabase/info';
import { ImageWithFallback } from './components/figma/ImageWithFallback';
import { getSupabaseClient } from './utils/supabase/client';

// Hotel Reservation System with Authentication
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
  const [dbError, setDbError] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
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
      
      if (session?.access_token) {
        setAccessToken(session.access_token);
        setUserEmail(session.user.email || '');
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error checking session:', error);
      setIsAuthenticated(false);
      setLoading(false);
    }
  };

  const handleLoginSuccess = (token: string) => {
    setAccessToken(token);
    setIsAuthenticated(true);
    toast.success('Berhasil login! Selamat datang kembali.');
  };

  const handleLogout = async () => {
    try {
      const supabase = getSupabaseClient();

      await supabase.auth.signOut();
      
      // Reset all states
      setAccessToken(null);
      setUserEmail('');
      setIsAuthenticated(false);
      setRooms([]);
      setReservations([]);
      
      toast.success('Berhasil logout');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Gagal logout');
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-aa71f191/rooms`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Gagal memuat data kamar');
      }

      setRooms(data.data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast.error('Gagal memuat data kamar');
      setDbError(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchReservations = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-aa71f191/reservations`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Gagal memuat data reservasi');
      }

      setReservations(data.data);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      toast.error('Gagal memuat data reservasi');
      setDbError(true);
    }
  };

  const handleBookRoom = (room: Room) => {
    setSelectedRoom(room);
    setBookingModalOpen(true);
  };

  const handleBookingSuccess = (reservation: Reservation, room: Room) => {
    setConfirmedReservation(reservation);
    setConfirmedRoom(room);
    setConfirmationModalOpen(true);
    fetchReservations();
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         room.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || room.type === filterType;
    
    // Advanced filters
    const matchesPrice = room.price >= filters.priceRange[0] && room.price <= filters.priceRange[1];
    const matchesCapacity = room.capacity >= filters.capacity;
    const matchesAmenities = filters.amenities.length === 0 || 
      filters.amenities.every(amenity => room.amenities.includes(amenity));
    const matchesAvailability = !filters.availableOnly || room.available;
    
    return matchesSearch && matchesType && matchesPrice && matchesCapacity && 
           matchesAmenities && matchesAvailability;
  });

  const roomTypes = ['all', ...Array.from(new Set(rooms.map(r => r.type)))];
  const allAmenities = Array.from(new Set(rooms.flatMap(r => r.amenities)));

  if (!isAuthenticated) {
    return (
      <>
        <Toaster position="top-center" richColors />
        <SetupInstructions dbError={dbError} projectId={projectId} publicAnonKey={publicAnonKey} />
        <AuthContainer
          onLoginSuccess={handleLoginSuccess}
          projectId={projectId}
          publicAnonKey={publicAnonKey}
        />
      </>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Hotel className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold">Grand Hotel Resort</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">Reservasi Hotel Terbaik</p>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4" />
                <span>{userEmail}</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t space-y-2">
              <div className="flex items-center gap-2 text-sm mb-2">
                <User className="w-4 h-4" />
                <span>{userEmail}</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout} className="w-full">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-[500px] overflow-hidden">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3RlbCUyMGxvYmJ5fGVufDF8fHx8MTc2MzM1NTg2MXww&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Hotel Lobby"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h2 className="text-5xl mb-4">Selamat Datang di Grand Hotel</h2>
            <p className="text-xl mb-8">Nikmati pengalaman menginap terbaik dengan fasilitas mewah</p>
            <div className="flex items-center justify-center gap-8 flex-wrap">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span>Rating 5.0</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                <span>Jakarta, Indonesia</span>
              </div>
              <div className="flex items-center gap-2">
                <Hotel className="w-5 h-5" />
                <span>{rooms.length} Tipe Kamar</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <Tabs defaultValue="rooms" className="space-y-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="rooms" id="rooms">
              <Hotel className="w-4 h-4 mr-2" />
              Kamar Tersedia
            </TabsTrigger>
            <TabsTrigger value="reservations" id="reservations">
              <Calendar className="w-4 h-4 mr-2" />
              Reservasi Saya
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rooms" className="space-y-6">
            {/* Dashboard Stats */}
            <DashboardStats />

            {/* Search & Filter */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                    <Input
                      placeholder="Cari kamar berdasarkan nama atau tipe..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <AdvancedFilters
                      filters={filters}
                      onFiltersChange={setFilters}
                      allAmenities={allAmenities}
                    />
                  </div>
                </div>
                
                <div className="flex gap-2 overflow-x-auto">
                  {roomTypes.map(type => (
                    <Badge
                      key={type}
                      variant={filterType === type ? "default" : "outline"}
                      className="cursor-pointer whitespace-nowrap"
                      onClick={() => setFilterType(type)}
                    >
                      {type === 'all' ? 'Semua Tipe' : type}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Room Grid */}
            {filteredRooms.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Tidak ada kamar yang ditemukan</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRooms.map(room => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    onBook={handleBookRoom}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="reservations" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl">Daftar Reservasi</h3>
                <p className="text-muted-foreground">
                  Total: {reservations.length} reservasi
                </p>
              </div>
              <Button onClick={fetchReservations}>
                Refresh
              </Button>
            </div>

            <ReservationsList
              reservations={reservations}
              rooms={rooms}
              onUpdate={fetchReservations}
            />
          </TabsContent>
        </Tabs>

        {/* Contact Section */}
        <section id="contact" className="mt-16 pt-8 border-t">
          <h3 className="text-2xl text-center mb-8">Hubungi Kami</h3>
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <Card>
              <CardContent className="pt-6 text-center">
                <Phone className="w-8 h-8 mx-auto mb-3 text-primary" />
                <p className="text-sm text-muted-foreground">Telepon</p>
                <p>+62 21 1234 5678</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Mail className="w-8 h-8 mx-auto mb-3 text-primary" />
                <p className="text-sm text-muted-foreground">Email</p>
                <p>info@grandhotel.com</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <MapPin className="w-8 h-8 mx-auto mb-3 text-primary" />
                <p className="text-sm text-muted-foreground">Alamat</p>
                <p>Jl. Sudirman No. 123, Jakarta</p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-muted mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 Grand Hotel Resort. All rights reserved.</p>
        </div>
      </footer>

      {/* Booking Modal */}
      <BookingModal
        room={selectedRoom}
        open={bookingModalOpen}
        onClose={() => {
          setBookingModalOpen(false);
          setSelectedRoom(null);
        }}
        onSuccess={handleBookingSuccess}
      />

      {/* Booking Confirmation */}
      <BookingConfirmation
        reservation={confirmedReservation}
        room={confirmedRoom}
        open={confirmationModalOpen}
        onClose={() => {
          setConfirmationModalOpen(false);
          setConfirmedReservation(null);
          setConfirmedRoom(null);
        }}
      />
    </div>
  );
}