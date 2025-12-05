from django.core.management.base import BaseCommand
from rooms.models import RoomType

class Command(BaseCommand):
    help = 'Create sample room types'

    def handle(self, *args, **options):
        room_types_data = [
            {
                'name': 'Standard Single',
                'description': 'Phòng đơn tiêu chuẩn với giường đơn, phù hợp cho 1 người',
                'price_per_night': 500000,
                'max_occupancy': 1,
                'amenities': 'Điều hòa, TV, WiFi miễn phí, Minibar'
            },
            {
                'name': 'Standard Double',
                'description': 'Phòng đôi tiêu chuẩn với giường đôi, phù hợp cho 2 người',
                'price_per_night': 800000,
                'max_occupancy': 2,
                'amenities': 'Điều hòa, TV, WiFi miễn phí, Minibar, Ban công'
            },
            {
                'name': 'Deluxe Room',
                'description': 'Phòng deluxe rộng rãi với view đẹp',
                'price_per_night': 1200000,
                'max_occupancy': 3,
                'amenities': 'Điều hòa, TV, WiFi miễn phí, Minibar, Ban công, Sofa, Bàn làm việc'
            },
        ]

        created_count = 0
        for room_type_data in room_types_data:
            room_type, created = RoomType.objects.get_or_create(
                name=room_type_data['name'],
                defaults=room_type_data
            )
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'✅ Created room type: {room_type.name} - {room_type.price_per_night:,} VND')
                )
            else:
                self.stdout.write(f'📋 Room type already exists: {room_type.name}')

        self.stdout.write(
            self.style.SUCCESS(f'\n🎉 Created {created_count} new room types!')
        )
        self.stdout.write(f'📊 Total room types in database: {RoomType.objects.count()}')