from django.urls import path
from . import views

app_name = 'app1'

urlpatterns = [
    path('', views.index, name='index'),
    path('shop/', views.shop, name='shop'),
    path('about/', views.about, name='about'),
    path('contact/', views.contact, name='contact'),
    path('cart/', views.cart, name='cart'),
    path('cart/add/', views.add_to_cart, name='add-to-cart'),
    path('cart/update/', views.update_cart, name='update-cart'),
    path('cart/remove/<int:pk>/', views.remove_from_cart, name='remove-from-cart'),
    path('cart/clear/', views.clear_cart, name='clear-cart'),
    path('checkout/', views.checkout, name='checkout'),
    path('place-order/', views.place_order, name='place-order'),
    path('order/<int:pk>/confirmation/', views.order_confirmation, name='order-confirmation'),
    path('wishlist/', views.wishlist, name='wishlist'),
    path('wishlist/add/', views.add_to_wishlist, name='wishlist-add'),
    path('wishlist/remove/<int:pk>/', views.remove_from_wishlist, name='wishlist-remove'),
    path('wishlist/clear/', views.clear_wishlist, name='wishlist-clear'),

    # Admin-style pages
    path('admin-dashboard/', views.admin_dashboard, name='admin-dashboard'),
    path('admin-products/', views.admin_products, name='admin-products'),
    path('admin-products/add/', views.admin_product_add, name='admin-product-add'),
    path('admin-products/<int:pk>/edit/', views.admin_product_edit, name='admin-product-edit'),
    path('admin-products/<int:pk>/delete/', views.admin_product_delete, name='admin-product-delete'),
    path('admin-orders/', views.admin_orders, name='admin-orders'),
    path('admin-orders/<int:pk>/update/', views.admin_order_update, name='admin-order-update'),
]
