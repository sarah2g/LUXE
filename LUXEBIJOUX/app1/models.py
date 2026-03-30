from django.db import models
import importlib
from decimal import Decimal
from django.utils import timezone

# Use ImageField if Pillow is installed, otherwise fall back to FileField so
# migrations and checks still run in environments without Pillow.
if importlib.util.find_spec('PIL'):
	_UploadField = models.ImageField
else:
	_UploadField = models.FileField


# Simple category model so products can be grouped
class Category(models.Model):
	name = models.CharField(max_length=100, unique=True)
	slug = models.SlugField(max_length=120, unique=True)

	class Meta:
		verbose_name_plural = 'categories'

	def __str__(self):
		return self.name


class Product(models.Model):
	name = models.CharField(max_length=200)
	description = models.TextField(blank=True)
	price = models.DecimalField(max_digits=10, decimal_places=2)
	stock = models.PositiveIntegerField(default=0)
	category = models.ForeignKey(Category, null=True, blank=True, on_delete=models.SET_NULL, related_name='products')
	image = _UploadField(upload_to='products/', null=True, blank=True)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		ordering = ['-created_at']

	def __str__(self):
		return self.name


class Order(models.Model):
	STATUS_NOT_CONFIRMED = 'not_confirmed'
	STATUS_CONFIRMED = 'confirmed'
	STATUS_DELIVERED = 'delivered'
	STATUS_CANCELLED = 'cancelled'

	STATUS_CHOICES = [
		(STATUS_NOT_CONFIRMED, 'Not confirmed'),
		(STATUS_CONFIRMED, 'Confirmed'),
		(STATUS_DELIVERED, 'Delivered'),
		(STATUS_CANCELLED, 'Cancelled'),
	]

	order_number = models.CharField(max_length=32, unique=True, blank=True)
	customer_name = models.CharField(max_length=200)
	customer_email = models.EmailField(blank=True)
	created_at = models.DateTimeField(auto_now_add=True)
	status = models.CharField(max_length=24, choices=STATUS_CHOICES, default=STATUS_NOT_CONFIRMED)

	class Meta:
		ordering = ['-created_at']

	def __str__(self):
		return self.order_number or f"#{self.pk}"

	def save(self, *args, **kwargs):
		# ensure there's an order_number; if not, save to get a PK then set a readable number
		if not self.order_number:
			# do an initial save to get a PK if necessary
			super().save(*args, **kwargs)
			self.order_number = f"#{1000 + int(self.pk)}"
			# save again to persist order_number
			return super().save(*args, **kwargs)
		return super().save(*args, **kwargs)

	@property
	def total(self):
		total = Decimal('0.00')
		for item in self.items.all():
			total += (item.price or Decimal('0.00')) * item.quantity
		return total


class OrderItem(models.Model):
	order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
	product = models.ForeignKey(Product, null=True, blank=True, on_delete=models.SET_NULL)
	name = models.CharField(max_length=200)
	price = models.DecimalField(max_digits=10, decimal_places=2)
	quantity = models.PositiveIntegerField(default=1)

	def __str__(self):
		return f"{self.name} ×{self.quantity}"

