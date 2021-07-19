import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../services/api";
import { Product, Stock } from "../types";

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem("@RocketShoes:cart");

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const productStockList = await api.get(`/stock/${productId}`);
      const productStock = productStockList.data.amount;

      const updatedCart = [...cart];

      const productIndex = updatedCart.findIndex((product) => productId === product.id);

      if (productIndex === -1) {
        const productsList = await api.get(`/products/${productId}`);
        const product = productsList.data;
        const newProduct = { ...product, amount: 1 };
        updatedCart.push(newProduct);
      } else {
        if (updatedCart[productIndex].amount <= productStock - 1) {
          updatedCart[productIndex].amount += 1;
        } else {
          toast.error("Quantidade solicitada fora de estoque");
        }
      }

      localStorage.setItem("@RocketShoes:cart", JSON.stringify(updatedCart));

      setCart(updatedCart);
    } catch {
      toast.error("Erro na adição do produto");
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  console.log(cart);

  const updateProductAmount = async ({ productId, amount }: UpdateProductAmount) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  return (
    <CartContext.Provider value={{ cart, addProduct, removeProduct, updateProductAmount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
