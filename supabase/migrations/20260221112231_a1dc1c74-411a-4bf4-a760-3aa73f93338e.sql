
-- Fix RLS policies: Change RESTRICTIVE to PERMISSIVE for tables that have both public and owner policies
-- Without this fix, public users can't view products, stores, or categories because RESTRICTIVE requires ALL policies to pass

-- products: public view + owner manage
DROP POLICY IF EXISTS "Public can view active products" ON public.products;
DROP POLICY IF EXISTS "Store owners manage products" ON public.products;
DROP POLICY IF EXISTS "Super admins manage all products" ON public.products;

CREATE POLICY "Public can view active products" ON public.products FOR SELECT USING (is_active = true);
CREATE POLICY "Store owners manage products" ON public.products FOR ALL USING (EXISTS (SELECT 1 FROM stores WHERE stores.id = products.store_id AND stores.user_id = auth.uid()));
CREATE POLICY "Super admins manage all products" ON public.products FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));

-- stores: public view + owner manage
DROP POLICY IF EXISTS "Public can view active stores" ON public.stores;
DROP POLICY IF EXISTS "Store owners can manage own store" ON public.stores;
DROP POLICY IF EXISTS "Super admins can manage all stores" ON public.stores;

CREATE POLICY "Public can view active stores" ON public.stores FOR SELECT USING (true);
CREATE POLICY "Store owners can manage own store" ON public.stores FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Super admins can manage all stores" ON public.stores FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));

-- product_categories: public view + owner manage
DROP POLICY IF EXISTS "Public can view categories" ON public.product_categories;
DROP POLICY IF EXISTS "Store owners manage categories" ON public.product_categories;
DROP POLICY IF EXISTS "Super admins manage all categories" ON public.product_categories;

CREATE POLICY "Public can view categories" ON public.product_categories FOR SELECT USING (true);
CREATE POLICY "Store owners manage categories" ON public.product_categories FOR ALL USING (EXISTS (SELECT 1 FROM stores WHERE stores.id = product_categories.store_id AND stores.user_id = auth.uid()));
CREATE POLICY "Super admins manage all categories" ON public.product_categories FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));

-- subscription_plans: public view + admin manage
DROP POLICY IF EXISTS "Anyone authenticated can view active plans" ON public.subscription_plans;
DROP POLICY IF EXISTS "Super admins manage plans" ON public.subscription_plans;

CREATE POLICY "Anyone can view active plans" ON public.subscription_plans FOR SELECT USING (is_active = true);
CREATE POLICY "Super admins manage plans" ON public.subscription_plans FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Fix remaining tables: owner + super_admin need PERMISSIVE (OR logic)
-- orders
DROP POLICY IF EXISTS "Store owners manage orders" ON public.orders;
DROP POLICY IF EXISTS "Super admins manage all orders" ON public.orders;
CREATE POLICY "Store owners manage orders" ON public.orders FOR ALL USING (EXISTS (SELECT 1 FROM stores WHERE stores.id = orders.store_id AND stores.user_id = auth.uid()));
CREATE POLICY "Super admins manage all orders" ON public.orders FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));

-- order_items
DROP POLICY IF EXISTS "Store owners manage order items" ON public.order_items;
DROP POLICY IF EXISTS "Super admins manage all order items" ON public.order_items;
CREATE POLICY "Store owners manage order items" ON public.order_items FOR ALL USING (EXISTS (SELECT 1 FROM orders o JOIN stores s ON s.id = o.store_id WHERE o.id = order_items.order_id AND s.user_id = auth.uid()));
CREATE POLICY "Super admins manage all order items" ON public.order_items FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));

-- filaments
DROP POLICY IF EXISTS "Store owners manage filaments" ON public.filaments;
DROP POLICY IF EXISTS "Super admins manage all filaments" ON public.filaments;
CREATE POLICY "Store owners manage filaments" ON public.filaments FOR ALL USING (EXISTS (SELECT 1 FROM stores WHERE stores.id = filaments.store_id AND stores.user_id = auth.uid()));
CREATE POLICY "Super admins manage all filaments" ON public.filaments FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));

-- filament_purchases
DROP POLICY IF EXISTS "Store owners manage filament purchases" ON public.filament_purchases;
DROP POLICY IF EXISTS "Super admins manage all filament purchases" ON public.filament_purchases;
CREATE POLICY "Store owners manage filament purchases" ON public.filament_purchases FOR ALL USING (EXISTS (SELECT 1 FROM filaments f JOIN stores s ON s.id = f.store_id WHERE f.id = filament_purchases.filament_id AND s.user_id = auth.uid()));
CREATE POLICY "Super admins manage all filament purchases" ON public.filament_purchases FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));

-- printers
DROP POLICY IF EXISTS "Store owners manage printers" ON public.printers;
DROP POLICY IF EXISTS "Super admins manage all printers" ON public.printers;
CREATE POLICY "Store owners manage printers" ON public.printers FOR ALL USING (EXISTS (SELECT 1 FROM stores WHERE stores.id = printers.store_id AND stores.user_id = auth.uid()));
CREATE POLICY "Super admins manage all printers" ON public.printers FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));

-- packaging
DROP POLICY IF EXISTS "Store owners manage packaging" ON public.packaging;
DROP POLICY IF EXISTS "Super admins manage all packaging" ON public.packaging;
CREATE POLICY "Store owners manage packaging" ON public.packaging FOR ALL USING (EXISTS (SELECT 1 FROM stores WHERE stores.id = packaging.store_id AND stores.user_id = auth.uid()));
CREATE POLICY "Super admins manage all packaging" ON public.packaging FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));

-- store_customers
DROP POLICY IF EXISTS "Store owners manage customers" ON public.store_customers;
DROP POLICY IF EXISTS "Super admins manage all customers" ON public.store_customers;
CREATE POLICY "Store owners manage customers" ON public.store_customers FOR ALL USING (EXISTS (SELECT 1 FROM stores WHERE stores.id = store_customers.store_id AND stores.user_id = auth.uid()));
CREATE POLICY "Super admins manage all customers" ON public.store_customers FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));

-- audit_log
DROP POLICY IF EXISTS "Store owners view own logs" ON public.audit_log;
DROP POLICY IF EXISTS "Super admins view all logs" ON public.audit_log;
CREATE POLICY "Store owners view own logs" ON public.audit_log FOR SELECT USING (EXISTS (SELECT 1 FROM stores WHERE stores.id = audit_log.store_id AND stores.user_id = auth.uid()));
CREATE POLICY "Store admins insert logs" ON public.audit_log FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM stores WHERE stores.id = audit_log.store_id AND stores.user_id = auth.uid()));
CREATE POLICY "Super admins view all logs" ON public.audit_log FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));

-- profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can view all profiles" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Super admins can view all profiles" ON public.profiles FOR SELECT USING (has_role(auth.uid(), 'super_admin'::app_role));

-- user_roles
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can manage roles" ON public.user_roles;
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Super admins can manage roles" ON public.user_roles FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));

-- saas_config
DROP POLICY IF EXISTS "Only super admins manage config" ON public.saas_config;
CREATE POLICY "Only super admins manage config" ON public.saas_config FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));
