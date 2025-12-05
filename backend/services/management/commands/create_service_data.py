from django.core.management.base import BaseCommand
from services.models import ServiceCategory, Service

class Command(BaseCommand):
    help = 'Create sample service data'

    def handle(self, *args, **options):
        # Tạo categories
        categories_data = [
            {
                'name': 'Đồ ăn',
                'description': 'Các món ăn và đồ uống',
                'icon': 'restaurant',
                'sort_order': 1
            },
            {
                'name': 'Đồ uống',
                'description': 'Nước ngọt, cà phê, trà',
                'icon': 'coffee',
                'sort_order': 2
            },
            {
                'name': 'Giặt sấy',
                'description': 'Dịch vụ giặt là, sấy khô',
                'icon': 'dry-cleaning',
                'sort_order': 3
            },
            {
                'name': 'Vệ sinh',
                'description': 'Dọn phòng, thay khăn',
                'icon': 'cleaning-services',
                'sort_order': 4
            },
            {
                'name': 'Tiện ích',
                'description': 'Wifi, điện thoại, taxi',
                'icon': 'build',
                'sort_order': 5
            }
        ]

        for cat_data in categories_data:
            category, created = ServiceCategory.objects.get_or_create(
                name=cat_data['name'],
                defaults=cat_data
            )
            if created:
                self.stdout.write(f"Created category: {category.name}")

        # Tạo services
        services_data = [
            # Đồ ăn
            {'name': 'Cơm gà', 'category': 'Đồ ăn', 'price': 45000, 'unit': 'phần', 'prep_time': 15},
            {'name': 'Phở bò', 'category': 'Đồ ăn', 'price': 50000, 'unit': 'tô', 'prep_time': 20},
            {'name': 'Bánh mì', 'category': 'Đồ ăn', 'price': 25000, 'unit': 'ổ', 'prep_time': 5},
            {'name': 'Cơm chiên', 'category': 'Đồ ăn', 'price': 40000, 'unit': 'phần', 'prep_time': 10},
            {'name': 'Mì tôm', 'category': 'Đồ ăn', 'price': 15000, 'unit': 'gói', 'prep_time': 5},
            
            # Đồ uống
            {'name': 'Coca Cola', 'category': 'Đồ uống', 'price': 15000, 'unit': 'chai', 'prep_time': 2},
            {'name': 'Nước suối', 'category': 'Đồ uống', 'price': 8000, 'unit': 'chai', 'prep_time': 1},
            {'name': 'Cà phê đen', 'category': 'Đồ uống', 'price': 20000, 'unit': 'ly', 'prep_time': 5},
            {'name': 'Trà đá', 'category': 'Đồ uống', 'price': 10000, 'unit': 'ly', 'prep_time': 3},
            {'name': 'Bia Saigon', 'category': 'Đồ uống', 'price': 25000, 'unit': 'chai', 'prep_time': 2},
            {'name': 'Chè ba màu', 'category': 'Đồ uống', 'price': 18000, 'unit': 'ly', 'prep_time': 8},
            
            # Giặt sấy
            {'name': 'Giặt quần áo', 'category': 'Giặt sấy', 'price': 30000, 'unit': 'kg', 'prep_time': 120},
            {'name': 'Giặt + sấy', 'category': 'Giặt sấy', 'price': 50000, 'unit': 'kg', 'prep_time': 180},
            {'name': 'Là áo sơ mi', 'category': 'Giặt sấy', 'price': 15000, 'unit': 'chiếc', 'prep_time': 30},
            {'name': 'Là vest', 'category': 'Giặt sấy', 'price': 35000, 'unit': 'bộ', 'prep_time': 45},
            
            # Vệ sinh
            {'name': 'Dọn phòng', 'category': 'Vệ sinh', 'price': 50000, 'unit': 'lần', 'prep_time': 30},
            {'name': 'Thay khăn tắm', 'category': 'Vệ sinh', 'price': 20000, 'unit': 'bộ', 'prep_time': 5},
            {'name': 'Thay ga giường', 'category': 'Vệ sinh', 'price': 25000, 'unit': 'bộ', 'prep_time': 10},
            
            # Tiện ích
            {'name': 'Gọi taxi', 'category': 'Tiện ích', 'price': 0, 'unit': 'lần', 'prep_time': 5},
            {'name': 'Thuê xe máy', 'category': 'Tiện ích', 'price': 150000, 'unit': 'ngày', 'prep_time': 15},
            {'name': 'Tour city', 'category': 'Tiện ích', 'price': 300000, 'unit': 'người', 'prep_time': 30},
        ]

        for service_data in services_data:
            try:
                category = ServiceCategory.objects.get(name=service_data['category'])
                service, created = Service.objects.get_or_create(
                    name=service_data['name'],
                    category=category,
                    defaults={
                        'description': f"Dịch vụ {service_data['name']} chất lượng cao",
                        'price': service_data['price'],
                        'unit': service_data['unit'],
                        'preparation_time': service_data['prep_time'],
                        'is_available': True
                    }
                )
                if created:
                    self.stdout.write(f"Created service: {service.name} - {service.price:,.0f} VND")
            except ServiceCategory.DoesNotExist:
                self.stdout.write(f"Category {service_data['category']} not found")

        self.stdout.write(self.style.SUCCESS("Successfully created service data!"))