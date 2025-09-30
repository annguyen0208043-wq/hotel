# Hotel Management System

Hệ thống quản lý khách sạn được xây dựng với Django REST API và React.js

## Tính năng chính

- **Quản lý nhân viên**: Thêm, sửa, xóa thông tin nhân viên, phân ca làm việc
- **Quản lý khách hàng**: Quản lý thông tin khách hàng, phân loại VIP
- **Quản lý phòng**: Quản lý phòng, loại phòng, trạng thái phòng
- **Đặt phòng**: Xử lý đặt phòng, check-in, check-out
- **Dịch vụ**: Quản lý dịch vụ khách sạn và đơn đặt dịch vụ
- **Thống kê doanh thu**: Dashboard, biểu đồ, báo cáo doanh thu

## Công nghệ sử dụng

### Backend
- Django 4.2.7
- Django REST Framework
- MySQL Database
- JWT Authentication
- CORS Headers

### Frontend
- React 18.2.0
- Ant Design
- React Query
- React Router
- Recharts (biểu đồ)
- Axios

## Cài đặt

### Backend (Django)

1. Tạo virtual environment:
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
```

2. Cài đặt dependencies:
```bash
pip install -r requirements.txt
```

3. Cấu hình database:
- Tạo database MySQL với tên `hotel_management_db`
- Cập nhật thông tin database trong `hotel_management/settings.py`

4. Chạy migrations:
```bash
python manage.py makemigrations
python manage.py migrate
```

5. Tạo superuser:
```bash
python manage.py createsuperuser
```

6. Chạy server:
```bash
python manage.py runserver
```

Backend sẽ chạy tại: http://localhost:8000

### Frontend (React)

1. Cài đặt dependencies:
```bash
cd frontend
npm install
```

2. Chạy development server:
```bash
npm start
```

Frontend sẽ chạy tại: http://localhost:3000

## API Endpoints

### Authentication
- `POST /api/employees/login/` - Đăng nhập
- `GET /api/employees/profile/` - Thông tin profile

### Employees
- `GET /api/employees/` - Danh sách nhân viên
- `POST /api/employees/` - Thêm nhân viên
- `PATCH /api/employees/{id}/` - Cập nhật nhân viên
- `DELETE /api/employees/{id}/` - Xóa nhân viên

### Customers
- `GET /api/customers/` - Danh sách khách hàng
- `POST /api/customers/` - Thêm khách hàng
- `GET /api/customers/search/?q={query}` - Tìm kiếm khách hàng

### Rooms
- `GET /api/rooms/` - Danh sách phòng
- `GET /api/rooms/types/` - Danh sách loại phòng
- `GET /api/rooms/bookings/` - Danh sách đặt phòng

### Services
- `GET /api/services/` - Danh sách dịch vụ
- `GET /api/services/orders/` - Danh sách đơn dịch vụ

### Revenue
- `GET /api/revenue/reports/dashboard/` - Dashboard data
- `GET /api/revenue/reports/monthly_chart/` - Biểu đồ theo tháng
- `GET /api/revenue/payments/` - Danh sách thanh toán

## Cấu trúc thư mục

```
hotel-management/
├── backend/
│   ├── hotel_management/          # Django project settings
│   ├── employees/                 # Employee app
│   ├── customers/                 # Customer app
│   ├── rooms/                     # Room & Booking app
│   ├── services/                  # Service app
│   ├── revenue/                   # Revenue & Payment app
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/           # Reusable components
│   │   ├── contexts/             # React contexts
│   │   ├── pages/               # Page components
│   │   ├── services/            # API services
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── README.md
└── README.md
```

## Models chính

### Employee
- Thông tin nhân viên, chức vụ, ca làm việc
- Extends Django User model

### Customer
- Thông tin khách hàng, CMND, VIP status

### Room & RoomType
- Thông tin phòng, loại phòng, trạng thái

### Booking
- Đặt phòng, check-in/out, thanh toán

### Service & ServiceOrder
- Dịch vụ khách sạn và đơn đặt dịch vụ

### Payment & RevenueReport
- Thanh toán và báo cáo doanh thu

## Tài khoản mặc định

Sau khi tạo superuser, bạn có thể đăng nhập vào hệ thống với:
- Username: admin
- Password: [mật khẩu bạn đã tạo]

## Phát triển tiếp

- [ ] Hoàn thiện các trang frontend
- [ ] Thêm tính năng upload ảnh
- [ ] Tích hợp email notifications
- [ ] Thêm unit tests
- [ ] Triển khai production
- [ ] Tối ưu performance

## Đóng góp

1. Fork project
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Tạo Pull Request

## License

MIT License