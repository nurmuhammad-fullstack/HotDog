import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import {
  Menu,
  X,
  ShoppingBag,
  Flame,
  MapPin,
  Phone,
  Clock,
  ChevronRight,
  Plus,
  Minus,
  Trash2,
  Star,
  User,
  LogOut,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../components/ui/sheet";
import { ScrollArea } from "../components/ui/scroll-area";
import { useCart, useAuth } from "../App";
import ProductCard from "../components/ProductCard";

const API = "/api";

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { cart, addToCart, updateQuantity, removeFromCart, cartTotal, cartCount } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API}/products`);
      setProducts(res.data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      toast.error("Mahsulotlarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: "all", name: "Hammasi" },
    { id: 1, name: "Burgers" },
    { id: 2, name: "Hot Dogs" },
    { id: 3, name: "Drinks" },
  ];

  const filteredProducts =
    activeCategory === "all"
      ? products
      : products.filter((p) => p.categoryId === activeCategory);

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error("Savatingiz bo'sh");
      return;
    }
    navigate("/buyurtma");
  };

  return (
    <div className="min-h-screen bg-background noise-overlay">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2" data-testid="logo">
              <Flame className="w-8 h-8 text-primary" />
              <span className="font-heading text-2xl md:text-3xl text-foreground uppercase">
                Hotdog<span className="text-primary">UZ</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#menyu" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
                Menyu
              </a>
              <a href="#aksiyalar" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
                Aksiyalar
              </a>
              <a href="#aloqa" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
                Aloqa
              </a>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              {user ? (
                <div className="hidden md:flex items-center gap-3">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {user.name || "User"}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={logout}
                    data-testid="logout-btn"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link to="/kirish">
                    <Button variant="ghost" size="sm" data-testid="login-link" className="text-muted-foreground hover:text-foreground">
                      Kirish
                    </Button>
                  </Link>
                  <Link to="/royhatdan-otish">
                    <Button size="sm" data-testid="register-link" className="bg-primary text-primary-foreground hover:bg-primary/90">
                      Ro'yxatdan o'tish
                    </Button>
                  </Link>
                </div>
              )}

              {/* Cart Button */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="relative border-primary/50 hover:bg-primary/10"
                    data-testid="cart-btn"
                  >
                    <ShoppingBag className="w-5 h-5 text-primary" />
                    {cartCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-secondary text-secondary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                        {cartCount}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent className="bg-card border-border w-full sm:max-w-md">
                  <SheetHeader>
                    <SheetTitle className="font-heading text-2xl text-foreground flex items-center gap-2">
                      <ShoppingBag className="w-6 h-6 text-primary" />
                      SAVAT
                    </SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col h-[calc(100vh-120px)] mt-6">
                    {cart.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                        <ShoppingBag className="w-16 h-16 mb-4 opacity-50" />
                        <p className="text-lg">Savatingiz bo'sh</p>
                      </div>
                    ) : (
                      <>
                        <ScrollArea className="flex-1 cart-scroll pr-4">
                          <div className="space-y-4">
                            {cart.map((item) => (
                              <div
                                key={item.product_id}
                                className="flex gap-4 p-3 bg-muted/30 rounded-lg"
                                data-testid={`cart-item-${item.product_id}`}
                              >
                                <img
                                  src={item.image || "https://images.unsplash.com/photo-1541214113241-21578d2d9b62?w=200"}
                                  alt={item.name}
                                  className="w-20 h-20 object-cover rounded-lg"
                                />
                                <div className="flex-1">
                                  <h4 className="font-medium text-foreground">{item.name}</h4>
                                  <p className="text-primary font-bold">{parseInt(item.price).toLocaleString()} so'm</p>
                                  <div className="flex items-center gap-2 mt-2">
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="w-7 h-7 border-border"
                                      onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                                      data-testid={`decrease-${item.product_id}`}
                                    >
                                      <Minus className="w-3 h-3" />
                                    </Button>
                                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="w-7 h-7 border-border"
                                      onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                                      data-testid={`increase-${item.product_id}`}
                                    >
                                      <Plus className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="w-7 h-7 text-secondary hover:text-secondary ml-auto"
                                      onClick={() => removeFromCart(item.product_id)}
                                      data-testid={`remove-${item.product_id}`}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                        <div className="border-t border-border pt-4 mt-4 space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Jami:</span>
                            <span className="font-heading text-2xl text-primary">
                              {cartTotal.toLocaleString()} so'm
                            </span>
                          </div>
                          <Button
                            className="w-full btn-primary"
                            onClick={handleCheckout}
                            data-testid="checkout-btn"
                          >
                            Buyurtma berish
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </SheetContent>
              </Sheet>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                data-testid="mobile-menu-btn"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-white/10">
              <div className="flex flex-col gap-4">
                <a
                  href="#menyu"
                  className="text-muted-foreground hover:text-foreground transition-colors font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Menyu
                </a>
                <a
                  href="#aksiyalar"
                  className="text-muted-foreground hover:text-foreground transition-colors font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Aksiyalar
                </a>
                <a
                  href="#aloqa"
                  className="text-muted-foreground hover:text-foreground transition-colors font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Aloqa
                </a>
                {user ? (
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {user.name}
                    </span>
                    <Button variant="ghost" size="sm" onClick={logout} className="text-secondary">
                      Chiqish
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2 pt-4 border-t border-white/10">
                    <Link to="/kirish" className="flex-1">
                      <Button variant="outline" className="w-full border-primary text-primary">
                        Kirish
                      </Button>
                    </Link>
                    <Link to="/royhatdan-otish" className="flex-1">
                      <Button className="w-full bg-primary text-primary-foreground">
                        Ro'yxatdan o'tish
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-20">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1654851979266-dcd5655a747b?w=1920')`,
          }}
        >
          <div className="absolute inset-0 bg-black/70"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-20">
          <div className="max-w-3xl">
            <Badge className="bg-secondary/20 text-secondary border-secondary/50 mb-6 font-accent">
              <Flame className="w-4 h-4 mr-1" />
              O'ZBEKISTONDA #1
            </Badge>
            <h1 className="font-heading text-5xl sm:text-6xl lg:text-8xl text-foreground uppercase leading-none mb-6" data-testid="hero-title">
              ENG MAZALI
              <br />
              <span className="text-primary">HOTDOG</span>LAR
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl">
              Toshkentdagi eng zo'r fast-food tajribasi. Sifatli mahsulotlar, tez yetkazib berish va arzon narxlar!
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#menyu">
                <Button className="btn-primary text-lg" data-testid="hero-cta">
                  MENYUNI KO'RISH
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </a>
              <a href="#aloqa">
                <Button variant="outline" className="btn-outline text-lg">
                  <Phone className="w-5 h-5 mr-2" />
                  BOG'LANISH
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section className="py-16 md:py-24 bg-card/50" id="menyu">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center gap-3 mb-8">
            <Flame className="w-8 h-8 text-primary" />
            <h2 className="font-heading text-3xl md:text-4xl text-foreground uppercase">
              Menyu
            </h2>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 mb-8 overflow-x-auto scrollbar-hide pb-2">
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={activeCategory === cat.id ? "default" : "outline"}
                className={
                  activeCategory === cat.id
                    ? "bg-primary text-primary-foreground whitespace-nowrap"
                    : "border-border text-muted-foreground hover:text-foreground whitespace-nowrap"
                }
                onClick={() => setActiveCategory(cat.id)}
                data-testid={`category-${cat.id}`}
              >
                {cat.name}
              </Button>
            ))}
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-card rounded-xl h-80 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 md:py-24 bg-card/50" id="aloqa">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="font-heading text-3xl md:text-4xl text-foreground uppercase mb-6">
                Biz Bilan Bog'laning
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-1">Manzil</h4>
                    <p className="text-muted-foreground">
                      Toshkent shahar, Chilonzor tumani
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
