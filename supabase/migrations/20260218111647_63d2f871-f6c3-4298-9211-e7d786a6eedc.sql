
-- Roles enum
CREATE TYPE public.app_role AS ENUM ('super_admin', 'store_admin');

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS for user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Super admins can manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Super admins can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'super_admin'));

-- Subscription plans (managed by super admin)
CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  max_products INTEGER NOT NULL DEFAULT 10,
  max_photos_per_product INTEGER NOT NULL DEFAULT 6,
  price_monthly NUMERIC(10,2) NOT NULL DEFAULT 0,
  is_trial BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  payment_methods TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view active plans" ON public.subscription_plans
  FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY "Super admins manage plans" ON public.subscription_plans
  FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- Stores (client stores)
CREATE TABLE public.stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL DEFAULT 'Minha Loja',
  logo_url TEXT,
  primary_color TEXT DEFAULT '#06b6d4',
  secondary_color TEXT DEFAULT '#0f172a',
  header_text TEXT DEFAULT 'Bem-vindo à nossa loja!',
  footer_text TEXT DEFAULT '',
  whatsapp_number TEXT,
  whatsapp_floating_enabled BOOLEAN DEFAULT true,
  product_columns INTEGER DEFAULT 3,
  is_active BOOLEAN DEFAULT true,
  subscription_plan_id UUID REFERENCES public.subscription_plans(id),
  subscription_status TEXT DEFAULT 'trial',
  subscription_started_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Store owners can manage own store" ON public.stores
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Super admins can manage all stores" ON public.stores
  FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Public can view active stores" ON public.stores
  FOR SELECT USING (true);

-- Product categories
CREATE TABLE public.product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Store owners manage categories" ON public.product_categories
  FOR ALL USING (EXISTS (SELECT 1 FROM public.stores WHERE id = store_id AND user_id = auth.uid()));
CREATE POLICY "Super admins manage all categories" ON public.product_categories
  FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Public can view categories" ON public.product_categories
  FOR SELECT USING (true);

-- 3D Printers
CREATE TABLE public.printers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  model TEXT,
  power_consumption_watts NUMERIC(10,2) DEFAULT 0,
  maintenance_cost_monthly NUMERIC(10,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.printers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Store owners manage printers" ON public.printers
  FOR ALL USING (EXISTS (SELECT 1 FROM public.stores WHERE id = store_id AND user_id = auth.uid()));
CREATE POLICY "Super admins manage all printers" ON public.printers
  FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- Filament inventory
CREATE TABLE public.filaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  material TEXT NOT NULL,
  color TEXT NOT NULL,
  brand TEXT,
  price_per_kg NUMERIC(10,2) NOT NULL DEFAULT 0,
  quantity_grams NUMERIC(10,2) NOT NULL DEFAULT 0,
  supplier TEXT,
  last_purchase_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.filaments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Store owners manage filaments" ON public.filaments
  FOR ALL USING (EXISTS (SELECT 1 FROM public.stores WHERE id = store_id AND user_id = auth.uid()));
CREATE POLICY "Super admins manage all filaments" ON public.filaments
  FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- Packaging inventory
CREATE TABLE public.packaging (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'caixa',
  dimensions TEXT,
  cost NUMERIC(10,2) DEFAULT 0,
  quantity INTEGER DEFAULT 0,
  supplier TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.packaging ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Store owners manage packaging" ON public.packaging
  FOR ALL USING (EXISTS (SELECT 1 FROM public.stores WHERE id = store_id AND user_id = auth.uid()));
CREATE POLICY "Super admins manage all packaging" ON public.packaging
  FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- Products
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.product_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  photos TEXT[] DEFAULT '{}',
  stl_file_url TEXT,
  has_color_variation BOOLEAN DEFAULT false,
  color_options TEXT[] DEFAULT '{}',
  is_customizable BOOLEAN DEFAULT false,
  customization_type TEXT,
  weight_grams NUMERIC(10,2) DEFAULT 0,
  production_time_minutes INTEGER DEFAULT 0,
  production_cost NUMERIC(10,2) DEFAULT 0,
  sale_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  is_on_sale BOOLEAN DEFAULT false,
  sale_price_promotional NUMERIC(10,2),
  card_fee_percent NUMERIC(5,2) DEFAULT 0,
  post_production_cost NUMERIC(10,2) DEFAULT 0,
  packaging_cost NUMERIC(10,2) DEFAULT 0,
  waste_rate_percent NUMERIC(5,2) DEFAULT 5,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Store owners manage products" ON public.products
  FOR ALL USING (EXISTS (SELECT 1 FROM public.stores WHERE id = store_id AND user_id = auth.uid()));
CREATE POLICY "Super admins manage all products" ON public.products
  FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Public can view active products" ON public.products
  FOR SELECT USING (is_active = true);

-- Store customers
CREATE TABLE public.store_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  source TEXT DEFAULT 'site',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.store_customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Store owners manage customers" ON public.store_customers
  FOR ALL USING (EXISTS (SELECT 1 FROM public.stores WHERE id = store_id AND user_id = auth.uid()));
CREATE POLICY "Super admins manage all customers" ON public.store_customers
  FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- Orders
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES public.store_customers(id) ON DELETE SET NULL,
  production_status TEXT DEFAULT 'aguardando',
  payment_status TEXT DEFAULT 'aguardando',
  printer_id UUID REFERENCES public.printers(id) ON DELETE SET NULL,
  filament_id UUID REFERENCES public.filaments(id) ON DELETE SET NULL,
  packaging_id UUID REFERENCES public.packaging(id) ON DELETE SET NULL,
  production_notes TEXT,
  total_amount NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Store owners manage orders" ON public.orders
  FOR ALL USING (EXISTS (SELECT 1 FROM public.stores WHERE id = store_id AND user_id = auth.uid()));
CREATE POLICY "Super admins manage all orders" ON public.orders
  FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- Order items
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  color_selected TEXT,
  customization_text TEXT,
  unit_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  notes TEXT
);
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Store owners manage order items" ON public.order_items
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.orders o
    JOIN public.stores s ON s.id = o.store_id
    WHERE o.id = order_id AND s.user_id = auth.uid()
  ));
CREATE POLICY "Super admins manage all order items" ON public.order_items
  FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- Audit log
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Store owners view own logs" ON public.audit_log
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.stores WHERE id = store_id AND user_id = auth.uid()));
CREATE POLICY "Super admins view all logs" ON public.audit_log
  FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- SaaS config (super admin settings)
CREATE TABLE public.saas_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  s3_bucket_name TEXT,
  s3_access_key TEXT,
  s3_secret_key TEXT,
  s3_region TEXT,
  s3_endpoint TEXT,
  smtp_host TEXT,
  smtp_port INTEGER,
  smtp_user TEXT,
  smtp_password TEXT,
  smtp_from_email TEXT,
  saas_whatsapp_number TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.saas_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only super admins manage config" ON public.saas_config
  FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- Filament purchase history
CREATE TABLE public.filament_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filament_id UUID REFERENCES public.filaments(id) ON DELETE CASCADE NOT NULL,
  quantity_grams NUMERIC(10,2) NOT NULL,
  price_paid NUMERIC(10,2),
  brand TEXT,
  supplier TEXT,
  purchase_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.filament_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Store owners manage filament purchases" ON public.filament_purchases
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.filaments f
    JOIN public.stores s ON s.id = f.store_id
    WHERE f.id = filament_id AND s.user_id = auth.uid()
  ));
CREATE POLICY "Super admins manage all filament purchases" ON public.filament_purchases
  FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), NEW.email);
  
  -- Create store_admin role for new users
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'store_admin');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger to create store on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_store_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  trial_plan_id UUID;
BEGIN
  IF NEW.role = 'store_admin' THEN
    SELECT id INTO trial_plan_id FROM public.subscription_plans WHERE is_trial = true AND is_active = true LIMIT 1;
    
    INSERT INTO public.stores (user_id, name, subscription_plan_id, subscription_status)
    VALUES (NEW.user_id, 'Minha Loja 3D', trial_plan_id, 'trial');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_store_admin_role_created
  AFTER INSERT ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_store_admin();

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON public.stores FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_filaments_updated_at BEFORE UPDATE ON public.filaments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
