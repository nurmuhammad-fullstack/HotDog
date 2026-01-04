# HotdogUZ - O'zbekiston Professional Hotdog Sayti

## Original Problem Statement
O'zbekistondagi #1 professional hotdog sayti. Qora menyu, ro'yxatdan o'tish, kirish, buyurtmani rasmiylashtirish, to'lov turini tanlash (naqd, Click, Payme, karta), savatcha funksiyalari. Buyurtma rasmiylashtirilganda Telegram botga xabar yuborish. O'zbek tilidagi interfeys.

## Completed Features

### Frontend (React)
- **Bosh sahifa (HomePage.jsx)**
  - Hero section with call-to-action
  - Mahsulotlar menyusi (kategoriya filtrlash)
  - Aksiyalar bo'limi
  - Aloqa ma'lumotlari
  - Mobile responsive dizayn
  
- **Savatcha (Sheet component)**
  - Mahsulot qo'shish/o'chirish
  - Miqdor o'zgartirish
  - Jami narx hisoblash
  - LocalStorage saqlash

- **Ro'yxatdan o'tish (RegisterPage.jsx)**
  - Ism, telefon, parol validatsiyasi
  - Parolni ko'rsatish/yashirish

- **Kirish (LoginPage.jsx)**
  - Telefon va parol bilan kirish
  - Session management

- **Buyurtma (CheckoutPage.jsx)**
  - 3 bosqichli checkout flow
  - Manzil kiritish formi
  - To'lov usulini tanlash (Naqd, Click, Payme, Karta)
  - Buyurtma tasdiqlash

### Backend (FastAPI)
- **Auth API**
  - POST /api/auth/register - Ro'yxatdan o'tish
  - POST /api/auth/login - Tizimga kirish

- **Products API**
  - GET /api/products - Mahsulotlar ro'yxati
  - GET /api/products/{id} - Bitta mahsulot
  - POST /api/products/seed - Demo mahsulotlar

- **Orders API**
  - POST /api/orders - Buyurtma yaratish
  - GET /api/orders/{user_id} - Foydalanuvchi buyurtmalari

- **Telegram Integration**
  - Buyurtma kelganda Telegram xabar yuborish (token kerak)

### Design System
- Qora tema (Midnight Street Food)
- Primary: Sariq (#facc15)
- Secondary: Qizil (#ef4444)
- Font: Anton (headings), Inter (body)

## Database Models (MongoDB)
- users: {id, name, phone, password, created_at}
- products: {id, name, description, price, image, category, is_popular, discount}
- orders: {id, user_id, user_name, user_phone, items, total, payment_method, address, status, created_at}

## Next Action Items

### High Priority
1. **Telegram Bot sozlash** - TELEGRAM_TOKEN va TELEGRAM_CHAT_ID o'rnatish backend/.env faylida
2. **Click/Payme integratsiyasi** - Haqiqiy to'lov tizimi qo'shish
3. **Admin panel** - Buyurtmalarni boshqarish uchun

### Medium Priority
4. **Buyurtma holati kuzatish** - Real-time order tracking
5. **SMS verification** - Telefon raqamini tasdiqlash
6. **Profil sahifasi** - Foydalanuvchi ma'lumotlari va buyurtmalar tarixi

### Low Priority
7. **Yetkazib berish vaqti hisoblash**
8. **Promo kodlar tizimi**
9. **Reyting va sharhlar**

## Environment Variables

### Backend (.env)
```
MONGO_URL="mongodb://localhost:27017"
DB_NAME="test_database"
CORS_ORIGINS="*"
TELEGRAM_TOKEN="your_bot_token"  # @BotFather dan olish
TELEGRAM_CHAT_ID="your_chat_id"  # Buyurtmalar yuboriladi
```

## Tech Stack
- Frontend: React 19, Tailwind CSS, Shadcn UI, Sonner (toast)
- Backend: FastAPI, Motor (async MongoDB), bcrypt
- Database: MongoDB
- External: Telegram Bot API
