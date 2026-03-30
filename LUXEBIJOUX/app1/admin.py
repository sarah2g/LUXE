from django.contrib import admin
from .models import Product, Category
from .models import Order, OrderItem


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
	list_display = ('name', 'slug')
	prepopulated_fields = {'slug': ('name',)}


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
	list_display = ('name', 'category', 'price', 'stock', 'created_at')
	list_filter = ('category',)
	search_fields = ('name', 'description')
	readonly_fields = ('created_at', 'updated_at')


class OrderItemInline(admin.TabularInline):
	model = OrderItem
	extra = 0
	readonly_fields = ('name', 'price')


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
	list_display = ('order_number', 'customer_name', 'total_amount', 'created_at', 'status')
	list_filter = ('status', 'created_at')
	search_fields = ('order_number', 'customer_name', 'customer_email')
	inlines = [OrderItemInline]
	actions = ['mark_confirmed', 'mark_delivered', 'mark_cancelled']

	def total_amount(self, obj):
		return obj.total
	total_amount.short_description = 'Total'

	def mark_confirmed(self, request, queryset):
		queryset.update(status=Order.STATUS_CONFIRMED)
	def mark_delivered(self, request, queryset):
		queryset.update(status=Order.STATUS_DELIVERED)
	def mark_cancelled(self, request, queryset):
		queryset.update(status=Order.STATUS_CANCELLED)
