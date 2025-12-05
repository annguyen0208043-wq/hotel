from django.core.management.base import BaseCommand
from services.models import Service, ServiceCategory, RoomServiceOrder, RoomServiceItem
from rooms.models import Room, Booking
from datetime import datetime, date

class Command(BaseCommand):
    help = 'Create sample room service orders'

    def handle(self, *args, **options):
        # Lấy phòng có booking
        occupied_rooms = Room.objects.filter(
            bookings__check_in_date__lte=date.today(),
            bookings__check_out_date__gte=date.today()
        ).distinct()[:3]  # Chỉ lấy 3 phòng
        
        if not occupied_rooms.exists():
            self.stdout.write("Không có phòng nào có booking để tạo dữ liệu sample")
            return
        
        # Lấy một số service
        services = Service.objects.filter(is_available=True)[:8]
        
        if not services.exists():
            self.stdout.write("Không có service nào để tạo order")
            return
        
        # Tạo orders cho từng phòng
        for i, room in enumerate(occupied_rooms):
            # Tạo 2-3 orders cho mỗi phòng
            for j in range(2):
                order = RoomServiceOrder.objects.create(
                    room=room,
                    status=['pending', 'confirmed', 'preparing'][j % 3],
                    payment_status='unpaid' if j == 0 else 'paid',
                    notes=f'Order test cho phòng {room.room_number}'
                )
                
                # Thêm items vào order
                selected_services = services[i*2:(i+1)*2+j]  # 2-3 services mỗi order
                for service in selected_services:
                    RoomServiceItem.objects.create(
                        order=order,
                        service=service,
                        quantity=(j + 1),  # 1-3 quantity
                        unit_price=service.price,
                        notes=f'Notes cho {service.name}'
                    )
                
                self.stdout.write(f"Created order {order.order_number} for room {room.room_number}")
        
        self.stdout.write(self.style.SUCCESS("Successfully created sample room service orders!"))