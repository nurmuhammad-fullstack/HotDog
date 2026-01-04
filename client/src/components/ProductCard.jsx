import { Plus } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

export default function ProductCard({ product, onAddToCart }) {
  return (
    <div className="product-card group" data-testid={`product-card-${product.id}`}>
      <div className="relative aspect-square overflow-hidden">
        <img
          src={product.image || "https://images.unsplash.com/photo-1541214113241-21578d2d9b62?w=500"}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {product.is_popular && (
          <Badge className="absolute top-3 left-3 bg-secondary text-white border-none">
            MASHHUR
          </Badge>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-heading text-xl text-foreground mb-1">{product.name}</h3>
        <p className="text-muted-foreground text-sm line-clamp-2 mb-4 h-10">
          {product.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="font-heading text-xl text-primary">
            {parseInt(product.price).toLocaleString()} so'm
          </span>
          <Button
            size="icon"
            className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => onAddToCart(product)}
            data-testid={`add-to-cart-${product.id}`}
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
