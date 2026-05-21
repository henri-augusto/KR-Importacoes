export type OrderStatus =
  | "pending"
  | "whatsapp_sent"
  | "confirmed"
  | "cancelled";

export type ProductGender = "masculino" | "feminino" | "unissex";

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string;
  description: string | null;
  gender: ProductGender | null;
  family: string | null;
  volume_ml: number | null;
  price_cents: number;
  compare_at_price_cents: number | null;
  stock_quantity: number;
  image_url: string | null;
  category_id: string | null;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  city: string | null;
  state: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  customer_id: string;
  status: OrderStatus;
  total_cents: number;
  notes: string | null;
  whatsapp_message: string | null;
  stock_discounted_at: string | null;
  created_at: string;
  updated_at: string;
  customer?: Customer;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name_snapshot: string;
  quantity: number;
  unit_price_cents: number;
  created_at: string;
}

export interface AdminProfile {
  id: string;
  full_name: string | null;
  role: "admin";
  created_at: string;
}
