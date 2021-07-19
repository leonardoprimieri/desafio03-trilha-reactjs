import { createContext, ReactNode, useContext, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../services/api";
import { Product } from "../types";

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
      const updatedCart = [...cart];

      const productStockList = await api.get(`/stock/${productId}`);
      const productStock = productStockList.data.amount;

      const productIndex = updatedCart.findIndex((product) => productId === product.id);

      if (productIndex === -1) {
        const productsList = await api.get(`/products/${productId}`);
        const product = productsList.data;
        const newProduct = { ...product, amount: 1 };
        updatedCart.push(newProduct);
      } else {
        if (updatedCart[productIndex].amount < productStock) {
          updatedCart[productIndex].amount += 1;
        } else {
          toast.error("Quantidade solicitada fora de estoque");
          return;
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
      const productExists = cart.find((product) => product.id === productId);
      if (productExists) {
        const filteredCart = cart.filter((product) => product.id !== productId);
        setCart(filteredCart);
        localStorage.setItem("@RocketShoes:cart", JSON.stringify(filteredCart));
      } else {
        throw Error();
      }
    } catch {
      toast.error("Erro na remoção do produto");
    }
  };

  const updateProductAmount = async ({ productId, amount }: UpdateProductAmount) => {
    try {
      if (amount <= 0) {
        return;
      }

      const productStockList = await api.get(`/stock/${productId}`);
      const productStock = productStockList.data.amount;

      if (amount > productStock) {
        toast.error("Quantidade solicitada fora de estoque");
        return;
      } else {
        const updatedCart = [...cart];
        const productExists = updatedCart.find((product) => product.id === productId);
        if (productExists) {
          productExists.amount = amount;
          setCart(updatedCart);
          localStorage.setItem("@RocketShoes:cart", JSON.stringify(updatedCart));
        } else {
          throw Error();
        }
      }
    } catch {
      toast.error("Erro na alteração de quantidade do produto");
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
