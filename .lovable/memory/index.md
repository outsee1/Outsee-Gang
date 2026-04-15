# Project Memory

## Core
Outsee brand: Dark theme (#0D0D0D), red accents, 0px border-radius, Space Grotesk. 1:1 product images.
Storefront: Filter by category only. Inline visual editing for admins. Drag-drop reordering.
Tech Stack: Supabase (`products`, `orders`, `user_roles`), Stripe via Edge Functions, Supabase Auth.
Checkout Flow: ViaCEP. Save order in DB *before* payment. Mandatory Number/Complement.
Contact: WhatsApp floating button (+5519989067693).
Admin Access: Supabase Auth with `user_roles` table (app_role enum). No more localStorage auth.
Sizes: Support both text (PP-XG) and numeric (38, 39...) sizes for clothing and shoes.

## Memories
- [Brand Identity & Styling](mem://identidade/marca-e-estilo) — Visual design rules, colors, and typography for Outsee
- [Catalog & Products](mem://loja/catalogo-e-produtos) — Supabase product tables, variants, and filtering rules
- [Checkout & Orders Flow](mem://loja/checkout-e-pedidos) — Checkout validation, ViaCEP, and order creation sequence
- [Third-Party Integrations](mem://integracoes/servicos-externos) — WhatsApp contact, Stripe payments, and Edge Functions webhooks
- [User Profile & Authentication](mem://usuario/perfil-e-autenticacao) — Supabase Auth email/password, user_roles for admin
- [Admin Panel](mem://admin/controle-administrativo) — Admin auth via Supabase, metrics dashboard, inline editing, drag-drop sort
