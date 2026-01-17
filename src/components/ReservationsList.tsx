import { useState, useEffect } from 'react';
import { Reservation, Room } from '../types/hotel';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Calendar, Users, Mail, Phone, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

interface ReservationsListProps {
  reservations: Reservation[];
  rooms: Room[];
  onUpdate: () => void;
}

export function ReservationsList({ reservations, rooms, onUpdate }: ReservationsListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getRoomName = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    return room?.name || 'Unknown Room';
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-aa71f191/reservations/${deleteId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Gagal menghapus reservasi');
      }

      toast.success('Reservasi berhasil dihapus');
      onUpdate();
    } catch (error) {
      console.error('Error deleting reservation:', error);
      toast.error('Gagal menghapus reservasi');
    } finally {
      setLoading(false);
      setDeleteId(null);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-aa71f191/reservations/${id}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({ status })
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Gagal mengupdate status');
      }

      toast.success('Status reservasi diperbarui');
      onUpdate();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Gagal mengupdate status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-500">Dikonfirmasi</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500">Dibatalkan</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500">Selesai</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (reservations.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Belum ada reservasi</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4">
        {reservations.map((reservation) => (
          <Card key={reservation.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{getRoomName(reservation.roomId)}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Kode Booking: {reservation.id}
                  </p>
                </div>
                {getStatusBadge(reservation.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>{reservation.guestName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{reservation.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{reservation.phone}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>Check-in: {formatDate(reservation.checkIn)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>Check-out: {formatDate(reservation.checkOut)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>{reservation.guests} tamu</span>
                  </div>
                </div>
              </div>

              {reservation.specialRequests && (
                <div className="mb-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm">
                    <span className="text-muted-foreground">Permintaan khusus: </span>
                    {reservation.specialRequests}
                  </p>
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t">
                <div>
                  <p className="text-sm text-muted-foreground">Total Pembayaran</p>
                  <p className="text-primary">{formatPrice(reservation.totalPrice)}</p>
                </div>
                
                <div className="flex gap-2">
                  {reservation.status === 'confirmed' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateStatus(reservation.id, 'completed')}
                        disabled={loading}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Selesai
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateStatus(reservation.id, 'cancelled')}
                        disabled={loading}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Batalkan
                      </Button>
                    </>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setDeleteId(reservation.id)}
                    disabled={loading}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Reservasi</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus reservasi ini? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={loading}>
              {loading ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
