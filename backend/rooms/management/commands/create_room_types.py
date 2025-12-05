from django.core.management.base import BaseCommand
from rooms.models import RoomType

class Command(BaseCommand):
    help = 'Create sample room types'

    def handle(self, *args, **options):
        room_types_data = [
            {
                'name': 'Phòng Tiêu Chuẩn',
                'description': 'Phòng tiêu chuẩn với đầy đủ tiện nghi cơ bản, phù hợp cho 1-2 người',
                'price_per_night': 500000,
                'max_occupancy': 2,
                'amenities': 'Giường đôi, Điều hòa, TV LED 32", WiFi miễn phí, Minibar, Tủ lạnh nhỏ, Bàn làm việc'
            },
            {
                'name': 'Phòng Cao Cấp',
                'description': 'Phòng cao cấp rộng rãi với view đẹp và tiện nghi hiện đại',
                'price_per_night': 800000,
                'max_occupancy': 3,
                'amenities': 'Giường King size, Điều hòa inverter, TV LED 43", WiFi tốc độ cao, Minibar cao cấp, Tủ lạnh, Bàn làm việc, Sofa, Ban công'
            },
            {
                'name': 'Phòng Suite',
                'description': 'Phòng suite sang trọng với phòng khách riêng và đầy đủ tiện ích cao cấp',
                'price_per_night': 1500000,
                'max_occupancy': 4,
                'amenities': 'Phòng ngủ riêng, Phòng khách, Giường King size, Điều hòa âm trần, TV LED 55", WiFi tốc độ cao, Minibar premium, Tủ lạnh lớn, Bàn làm việc, Sofa cao cấp, Ban công lớn, Bồn tắm Jacuzzi'
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