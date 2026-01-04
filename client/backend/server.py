from fastapi import FastAPI, APIRouter, HTTPException, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import httpx
import bcrypt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Telegram config
TELEGRAM_TOKEN = os.environ.get('TELEGRAM_TOKEN', '')
TELEGRAM_CHAT_ID = os.environ.get('TELEGRAM_CHAT_ID', '')

app = FastAPI()
api_router = APIRouter(prefix="/api")

# ============ MODELS ============

class UserCreate(BaseModel):
    name: str
    phone: str
    password: str

class UserLogin(BaseModel):
    phone: str
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    phone: str

class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    price: int
    image: str
    category: str
    is_popular: bool = False
    discount: Optional[int] = None

class CartItem(BaseModel):
    product_id: str
    name: str
    price: int
    quantity: int
    image: str

class CartUpdate(BaseModel):
    product_id: str
    quantity: int

class AddressInfo(BaseModel):
    street: str
    house: str
    apartment: Optional[str] = ""
    entrance: Optional[str] = ""
    floor: Optional[str] = ""
    comment: Optional[str] = ""

class OrderCreate(BaseModel):
    user_id: str
    user_name: str
    user_phone: str
    items: List[CartItem]
    total: int
    payment_method: str  # naqd, click, payme, karta
    address: AddressInfo

class OrderResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    user_name: str
    user_phone: str
    items: List[CartItem]
    total: int
    payment_method: str
    address: AddressInfo
    status: str
    created_at: str

# ============ HELPER FUNCTIONS ============

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

async def send_telegram_message(message: str):
    """Send order notification to Telegram"""
    if not TELEGRAM_TOKEN or not TELEGRAM_CHAT_ID:
        logging.warning("Telegram not configured, skipping notification")
        return False
    
    url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage"
    payload = {
        "chat_id": TELEGRAM_CHAT_ID,
        "text": message,
        "parse_mode": "HTML"
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload)
            return response.status_code == 200
    except Exception as e:
        logging.error(f"Telegram error: {e}")
        return False

# ============ AUTH ROUTES ============

@api_router.post("/auth/register", response_model=UserResponse)
async def register(user: UserCreate):
    # Validate input
    if not user.name or len(user.name.strip()) < 2:
        raise HTTPException(status_code=400, detail="Ism kamida 2 ta belgidan iborat bo'lishi kerak")
    
    if not user.phone or len(user.phone) < 9:
        raise HTTPException(status_code=400, detail="Telefon raqami noto'g'ri")
    
    if not user.password or len(user.password) < 6:
        raise HTTPException(status_code=400, detail="Parol kamida 6 ta belgidan iborat bo'lishi kerak")
    
    # Check if phone exists
    existing = await db.users.find_one({"phone": user.phone}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Bu telefon raqami allaqachon ro'yxatdan o'tgan")
    
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "name": user.name,
        "phone": user.phone,
        "password": hash_password(user.password),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user_doc)
    
    return UserResponse(id=user_id, name=user.name, phone=user.phone)

@api_router.post("/auth/login", response_model=UserResponse)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"phone": credentials.phone}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Telefon raqami yoki parol noto'g'ri")
    
    if not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Telefon raqami yoki parol noto'g'ri")
    
    return UserResponse(id=user["id"], name=user["name"], phone=user["phone"])

# ============ PRODUCTS ROUTES ============

@api_router.get("/products", response_model=List[Product])
async def get_products():
    products = await db.products.find({}, {"_id": 0}).to_list(100)
    return products

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Mahsulot topilmadi")
    return product

@api_router.post("/products/seed")
async def seed_products():
    """Seed demo products"""
    products = [
        {
            "id": str(uuid.uuid4()),
            "name": "Classic Hotdog",
            "description": "An'anaviy hotdog, xantal sosiska, ketchup va gorchitsa bilan",
            "price": 18000,
            "image": "https://images.unsplash.com/photo-1518208573537-70867b0f77d8?w=400",
            "category": "hotdog",
            "is_popular": True,
            "discount": None
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Mega Hotdog",
            "description": "Katta o'lchamdagi hotdog, ikki sosiska, pishloq va barcha souslar",
            "price": 28000,
            "image": "https://images.unsplash.com/photo-1654851979266-dcd5655a747b?w=400",
            "category": "hotdog",
            "is_popular": True,
            "discount": 15
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Cheese Hotdog",
            "description": "Pishloqli hotdog, mozzarella va cheddar pishloqi bilan",
            "price": 24000,
            "image": "https://images.unsplash.com/photo-1612392062631-94c61ac06691?w=400",
            "category": "hotdog",
            "is_popular": False,
            "discount": None
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Spicy Hotdog",
            "description": "Achchiq hotdog, jalapeno va achchiq sous bilan",
            "price": 22000,
            "image": "https://images.unsplash.com/photo-1619740455993-9d701c8a8f87?w=400",
            "category": "hotdog",
            "is_popular": False,
            "discount": None
        },
        {
            "id": str(uuid.uuid4()),
            "name": "BBQ Hotdog",
            "description": "BBQ sousli hotdog, piyoz va jalapeno bilan",
            "price": 25000,
            "image": "https://images.unsplash.com/photo-1496054545419-8d94c6d9a5b2?w=400",
            "category": "hotdog",
            "is_popular": True,
            "discount": 10
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Kartoshka Fri",
            "description": "Qarsildoq kartoshka fri, maxsus ziravorlar bilan",
            "price": 12000,
            "image": "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=400",
            "category": "garnir",
            "is_popular": True,
            "discount": None
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Pishloqli Fri",
            "description": "Kartoshka fri eritilgan pishloq bilan",
            "price": 16000,
            "image": "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400",
            "category": "garnir",
            "is_popular": False,
            "discount": None
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Coca-Cola",
            "description": "Sovuq Coca-Cola 0.5L",
            "price": 8000,
            "image": "https://images.unsplash.com/photo-1639834482101-5f332c3b701f?w=400",
            "category": "ichimlik",
            "is_popular": True,
            "discount": None
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Fanta",
            "description": "Sovuq Fanta 0.5L",
            "price": 8000,
            "image": "https://images.unsplash.com/photo-1624517452488-04869289c4ca?w=400",
            "category": "ichimlik",
            "is_popular": False,
            "discount": None
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Suv",
            "description": "Toza ichimlik suvi 0.5L",
            "price": 4000,
            "image": "https://images.unsplash.com/photo-1560023907-5f339617ea30?w=400",
            "category": "ichimlik",
            "is_popular": False,
            "discount": None
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Combo Set 1",
            "description": "Classic Hotdog + Kartoshka Fri + Coca-Cola",
            "price": 35000,
            "image": "https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=400",
            "category": "combo",
            "is_popular": True,
            "discount": 20
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Combo Set 2",
            "description": "Mega Hotdog + Pishloqli Fri + Ichimlik",
            "price": 48000,
            "image": "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400",
            "category": "combo",
            "is_popular": True,
            "discount": 25
        }
    ]
    
    # Clear existing products and insert new ones
    await db.products.delete_many({})
    await db.products.insert_many(products)
    
    return {"message": f"{len(products)} ta mahsulot qo'shildi"}

# ============ ORDERS ROUTES ============

@api_router.post("/orders", response_model=OrderResponse)
async def create_order(order: OrderCreate):
    order_id = str(uuid.uuid4())
    created_at = datetime.now(timezone.utc).isoformat()
    
    order_doc = {
        "id": order_id,
        "user_id": order.user_id,
        "user_name": order.user_name,
        "user_phone": order.user_phone,
        "items": [item.model_dump() for item in order.items],
        "total": order.total,
        "payment_method": order.payment_method,
        "address": order.address.model_dump(),
        "status": "yangi",
        "created_at": created_at
    }
    
    await db.orders.insert_one(order_doc)
    
    # Send Telegram notification
    items_text = "\n".join([f"  • {item.name} x{item.quantity} = {item.price * item.quantity:,} so'm" for item in order.items])
    
    payment_names = {
        "naqd": "Naqd pul",
        "click": "Click",
        "payme": "Payme",
        "karta": "Karta orqali"
    }
    
    message = f"""🌭 <b>YANGI BUYURTMA!</b>

📋 <b>Buyurtma:</b> #{order_id[:8]}
👤 <b>Mijoz:</b> {order.user_name}
📞 <b>Telefon:</b> {order.user_phone}

🍽 <b>Mahsulotlar:</b>
{items_text}

💰 <b>Jami:</b> {order.total:,} so'm
💳 <b>To'lov:</b> {payment_names.get(order.payment_method, order.payment_method)}

📍 <b>Manzil:</b>
{order.address.street}, {order.address.house}
{f"Kvartira: {order.address.apartment}" if order.address.apartment else ""}
{f"Podezd: {order.address.entrance}" if order.address.entrance else ""}
{f"Qavat: {order.address.floor}" if order.address.floor else ""}
{f"Izoh: {order.address.comment}" if order.address.comment else ""}
"""
    
    await send_telegram_message(message)
    
    return OrderResponse(**order_doc)

@api_router.get("/orders/{user_id}", response_model=List[OrderResponse])
async def get_user_orders(user_id: str):
    orders = await db.orders.find({"user_id": user_id}, {"_id": 0}).to_list(100)
    return orders

# ============ ROOT ROUTE ============

@api_router.get("/")
async def root():
    return {"message": "Hotdog UZ API", "version": "1.0"}

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
