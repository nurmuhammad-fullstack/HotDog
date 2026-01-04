import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import {
  Flame,
  ArrowLeft,
  MapPin,
  CreditCard,
  Banknote,
  Smartphone,
  CheckCircle,
  ShoppingBag,
  Send,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { useCart, useAuth } from "../App";

const API = `${""}/api`;

const paymentMethods = [
  { id: "naqd", name: "Naqd pul", icon: Banknote, description: "Yetkazib berishda to'lang" },
  { id: "click", name: "Click", icon: Smartphone, description: "Click orqali to'lang" },
  { id: "payme", name: "Payme", icon: Smartphone, description: "Payme orqali to'lang" },
  { id: "karta", name: "Karta orqali", icon: CreditCard, description: "Bank kartasi orqali" },
];

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: Address, 2: Payment, 3: Success
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const [address, setAddress] = useState({
    street: "",
    house: "",
    apartment: "",
    entrance: "",
    floor: "",
    comment: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("naqd");

  const handleAddressChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    if (!address.street || !address.house) {
      toast.error("Ko'cha va uy raqamini kiriting");
      return;
    }
    setStep(2);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData = {
        user_id: user.id,
        user_name: user.name,
        user_phone: user.phone,
        items: cart,
        total: cartTotal,
        payment_method: paymentMethod,
        address: address,
      };

      const res = await axios.post(`${API}/orders`, orderData);
      setOrderId(res.data.id);
      clearCart();
      setStep(3);
      toast.success("Buyurtmangiz qabul qilindi!");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  // Redirect if no user or empty cart
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-heading text-2xl text-foreground mb-4">
            Tizimga kiring
          </h2>
          <p className="text-muted-foreground mb-6">
            Buyurtma berish uchun tizimga kirishingiz kerak
          </p>
          <Link to="/kirish">
            <Button className="btn-primary">Kirish</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0 && step !== 3) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-heading text-2xl text-foreground mb-4">
            Savatingiz bo'sh
          </h2>
          <p className="text-muted-foreground mb-6">
            Buyurtma berish uchun mahsulot tanlang
          </p>
          <Link to="/">
            <Button className="btn-primary">Menyuga o'tish</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            data-testid="back-home"
          >
            <ArrowLeft className="w-4 h-4" />
            Orqaga
          </Link>
          <div className="flex items-center gap-2">
            <Flame className="w-8 h-8 text-primary" />
            <span className="font-heading text-2xl text-foreground uppercase">
              Hotdog<span className="text-primary">UZ</span>
            </span>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-12">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step >= s
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {step > s ? <CheckCircle className="w-5 h-5" /> : s}
              </div>
              {s < 3 && (
                <div
                  className={`w-16 h-1 mx-2 rounded ${
                    step > s ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Address */}
            {step === 1 && (
              <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <MapPin className="w-6 h-6 text-primary" />
                  <h2 className="font-heading text-2xl text-foreground">
                    YETKAZIB BERISH MANZILI
                  </h2>
                </div>

                <form onSubmit={handleAddressSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="street" className="text-foreground">
                        Ko'cha nomi *
                      </Label>
                      <Input
                        id="street"
                        name="street"
                        placeholder="Masalan: Bunyodkor ko'chasi"
                        value={address.street}
                        onChange={handleAddressChange}
                        className="h-12 bg-muted/50 border-border focus:border-primary"
                        data-testid="street-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="house" className="text-foreground">
                        Uy raqami *
                      </Label>
                      <Input
                        id="house"
                        name="house"
                        placeholder="Masalan: 15"
                        value={address.house}
                        onChange={handleAddressChange}
                        className="h-12 bg-muted/50 border-border focus:border-primary"
                        data-testid="house-input"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="apartment" className="text-foreground">
                        Kvartira
                      </Label>
                      <Input
                        id="apartment"
                        name="apartment"
                        placeholder="25"
                        value={address.apartment}
                        onChange={handleAddressChange}
                        className="h-12 bg-muted/50 border-border focus:border-primary"
                        data-testid="apartment-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="entrance" className="text-foreground">
                        Podezd
                      </Label>
                      <Input
                        id="entrance"
                        name="entrance"
                        placeholder="2"
                        value={address.entrance}
                        onChange={handleAddressChange}
                        className="h-12 bg-muted/50 border-border focus:border-primary"
                        data-testid="entrance-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="floor" className="text-foreground">
                        Qavat
                      </Label>
                      <Input
                        id="floor"
                        name="floor"
                        placeholder="5"
                        value={address.floor}
                        onChange={handleAddressChange}
                        className="h-12 bg-muted/50 border-border focus:border-primary"
                        data-testid="floor-input"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="comment" className="text-foreground">
                      Izoh (ixtiyoriy)
                    </Label>
                    <Textarea
                      id="comment"
                      name="comment"
                      placeholder="Qo'shimcha ma'lumot yozing..."
                      value={address.comment}
                      onChange={handleAddressChange}
                      className="bg-muted/50 border-border focus:border-primary min-h-[100px]"
                      data-testid="comment-input"
                    />
                  </div>

                  <Button type="submit" className="w-full btn-primary" data-testid="continue-to-payment">
                    DAVOM ETISH
                  </Button>
                </form>
              </div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <CreditCard className="w-6 h-6 text-primary" />
                  <h2 className="font-heading text-2xl text-foreground">
                    TO'LOV USULI
                  </h2>
                </div>

                <form onSubmit={handlePaymentSubmit}>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                    className="space-y-4 mb-8"
                  >
                    {paymentMethods.map((method) => (
                      <label
                        key={method.id}
                        className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                          paymentMethod === method.id
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                        data-testid={`payment-${method.id}`}
                      >
                        <RadioGroupItem value={method.id} />
                        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                          <method.icon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">{method.name}</h4>
                          <p className="text-sm text-muted-foreground">{method.description}</p>
                        </div>
                      </label>
                    ))}
                  </RadioGroup>

                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 btn-outline"
                      onClick={() => setStep(1)}
                      data-testid="back-to-address"
                    >
                      ORQAGA
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 btn-primary"
                      disabled={loading}
                      data-testid="submit-order"
                    >
                      {loading ? "KUTILMOQDA..." : "BUYURTMA BERISH"}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Step 3: Success */}
            {step === 3 && (
              <div className="bg-card border border-border rounded-2xl p-6 md:p-8 text-center">
                <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-accent" />
                </div>
                <h2 className="font-heading text-3xl text-foreground mb-4">
                  BUYURTMA QABUL QILINDI!
                </h2>
                <p className="text-muted-foreground mb-6">
                  Buyurtma raqami: <span className="text-primary font-bold">#{orderId?.slice(0, 8)}</span>
                </p>

                <div className="bg-muted/30 rounded-xl p-4 mb-8 flex items-center gap-3">
                  <Send className="w-6 h-6 text-primary flex-shrink-0" />
                  <p className="text-sm text-muted-foreground text-left">
                    Buyurtmangiz haqida <span className="text-primary font-medium">Telegram</span> orqali xabar yuborildi. 
                    Tez orada operatorimiz siz bilan bog'lanadi.
                  </p>
                </div>

                <Link to="/">
                  <Button className="btn-primary" data-testid="back-to-menu">
                    BOSH SAHIFAGA QAYTISH
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          {step !== 3 && (
            <div className="lg:col-span-1">
              <div className="bg-card border border-border rounded-2xl p-6 sticky top-24">
                <h3 className="font-heading text-xl text-foreground mb-4">
                  BUYURTMA
                </h3>

                <div className="space-y-3 mb-6">
                  {cart.map((item) => (
                    <div key={item.product_id} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{item.quantity}x</span>
                        <span className="text-foreground text-sm">{item.name}</span>
                      </div>
                      <span className="text-foreground font-medium">
                        {(item.price * item.quantity).toLocaleString()} so'm
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-muted-foreground">Mahsulotlar:</span>
                    <span className="text-foreground">{cartTotal.toLocaleString()} so'm</span>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-muted-foreground">Yetkazib berish:</span>
                    <span className="text-accent font-medium">Bepul</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-border">
                    <span className="font-heading text-lg text-foreground">JAMI:</span>
                    <span className="font-heading text-2xl text-primary">
                      {cartTotal.toLocaleString()} so'm
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
