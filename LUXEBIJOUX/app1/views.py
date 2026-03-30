from django.shortcuts import render, get_object_or_404, redirect
from django.urls import reverse
from .models import Product, Category
from .forms import ProductForm
from django.views.decorators.http import require_POST
from django.http import JsonResponse
from decimal import Decimal


# Basic views that render the static templates we added under templates/
def index(request):
	# show a few featured products on the home page
	products = Product.objects.select_related('category').filter(stock__gt=0)[:6]
	# pass wishlist ids so templates can mark favorited items
	wishlist = request.session.get('wishlist', [])
	wishlist_ids = set(int(pk) for pk in wishlist) if wishlist else set()
	return render(request, 'index.html', {'products': products, 'wishlist_ids': wishlist_ids})


def shop(request):
	# full product listing
	products = Product.objects.select_related('category').all()
	categories = Category.objects.all()
	wishlist = request.session.get('wishlist', [])
	wishlist_ids = set(int(pk) for pk in wishlist) if wishlist else set()
	return render(request, 'shop.html', {'products': products, 'categories': categories, 'wishlist_ids': wishlist_ids})


def about(request):
	return render(request, 'about.html')


def contact(request):
	return render(request, 'contact.html')


def cart(request):
	# Build cart items from session
	cart = request.session.get('cart', {})
	items = []
	subtotal = Decimal('0.00')
	if cart:
		pks = [int(k) for k in cart.keys()]
		products = Product.objects.filter(pk__in=pks).select_related('category')
		prod_map = {p.pk: p for p in products}
		for pk_str, qty in cart.items():
			pk = int(pk_str)
			p = prod_map.get(pk)
			if not p:
				continue
			q = int(qty)
			total = p.price * q
			subtotal += total
			items.append({'product': p, 'quantity': q, 'total': total})
	return render(request, 'cart.html', {'items': items, 'subtotal': subtotal})


@require_POST
def add_to_cart(request):
	product_id = request.POST.get('product_id') or request.POST.get('id')
	try:
		qty = int(request.POST.get('quantity', 1))
	except (TypeError, ValueError):
		qty = 1
	product = get_object_or_404(Product, pk=product_id)
	cart = request.session.get('cart', {})
	key = str(product.pk)
	cart[key] = int(cart.get(key, 0)) + max(1, qty)
	request.session['cart'] = cart
	request.session.modified = True
	# redirect back to referring page or cart
	next_url = request.POST.get('next') or request.META.get('HTTP_REFERER') or reverse('app1:cart')
	return redirect(next_url)


@require_POST
def update_cart(request):
	product_id = request.POST.get('product_id')
	try:
		qty = int(request.POST.get('quantity', 0))
	except (TypeError, ValueError):
		qty = 0
	cart = request.session.get('cart', {})
	key = str(product_id)
	if qty > 0:
		cart[key] = qty
	else:
		cart.pop(key, None)
	request.session['cart'] = cart
	request.session.modified = True
	return redirect('app1:cart')


@require_POST
def remove_from_cart(request, pk):
	cart = request.session.get('cart', {})
	cart.pop(str(pk), None)
	request.session['cart'] = cart
	request.session.modified = True
	return redirect('app1:cart')


@require_POST
def clear_cart(request):
	request.session.pop('cart', None)
	request.session.modified = True
	return redirect('app1:cart')


def checkout(request):
	# Build cart items similar to cart view so checkout shows current items
	cart = request.session.get('cart', {})
	items = []
	subtotal = Decimal('0.00')
	if cart:
		pks = [int(k) for k in cart.keys()]
		products = Product.objects.filter(pk__in=pks).select_related('category')
		prod_map = {p.pk: p for p in products}
		for pk_str, qty in cart.items():
			pk = int(pk_str)
			p = prod_map.get(pk)
			if not p:
				continue
			q = int(qty)
			total = p.price * q
			subtotal += total
			items.append({'product': p, 'quantity': q, 'total': total})
	return render(request, 'checkout.html', {'items': items, 'subtotal': subtotal})


@require_POST
def place_order(request):
	"""Create an Order from the session cart and clear the cart."""
	from .models import Order, OrderItem
	# collect simple customer info from form
	first_name = request.POST.get('first_name', '').strip()
	last_name = request.POST.get('last_name', '').strip()
	customer_name = (first_name + ' ' + last_name).strip() or 'Guest'
	customer_email = request.POST.get('email', '').strip()

	# create order
	order = Order(customer_name=customer_name, customer_email=customer_email, status=Order.STATUS_CONFIRMED)
	order.save()

	# build items from session cart
	cart = request.session.get('cart', {})
	if cart:
		pks = [int(k) for k in cart.keys()]
		products = Product.objects.filter(pk__in=pks)
		prod_map = {p.pk: p for p in products}
		for pk_str, qty in cart.items():
			pk = int(pk_str)
			p = prod_map.get(pk)
			if not p:
				continue
			q = int(qty)
			item = OrderItem(order=order, product=p, name=p.name, price=p.price, quantity=q)
			item.save()

	# clear cart
	request.session.pop('cart', None)
	request.session.modified = True

	return redirect('app1:order-confirmation', pk=order.pk)


def order_confirmation(request, pk):
	from .models import Order
	order = get_object_or_404(Order, pk=pk)
	# ensure items are available
	items = list(order.items.all())
	return render(request, 'order-confirmation.html', {'order': order, 'items': items})


def wishlist(request):
	# build wishlist items from session
	wishlist = request.session.get('wishlist', [])
	items = []
	if wishlist:
		pks = [int(pk) for pk in wishlist]
		products = Product.objects.filter(pk__in=pks).select_related('category')
		# preserve ordering as in wishlist
		prod_map = {p.pk: p for p in products}
		for pk_str in wishlist:
			p = prod_map.get(int(pk_str))
			if p:
				items.append(p)
	return render(request, 'wishlist.html', {'items': items})


@require_POST
def add_to_wishlist(request):
	product_id = request.POST.get('product_id') or request.POST.get('id')
	product = get_object_or_404(Product, pk=product_id)
	wishlist = request.session.get('wishlist', [])
	key = str(product.pk)
	if key not in wishlist:
		wishlist.append(key)
		request.session['wishlist'] = wishlist
		request.session.modified = True
	# If this is an AJAX request, return JSON so client can update UI without redirect
	if request.headers.get('x-requested-with') == 'XMLHttpRequest':
		data = {
			'added': True,
			'id': product.pk,
			'name': product.name,
			'price': str(product.price),
			'image_url': product.image.url if getattr(product, 'image', None) else '',
			'category': product.category.name if product.category else ''
		}
		return JsonResponse(data)
	next_url = request.POST.get('next') or request.META.get('HTTP_REFERER') or reverse('app1:wishlist')
	return redirect(next_url)


@require_POST
def remove_from_wishlist(request, pk):
	wishlist = request.session.get('wishlist', [])
	key = str(pk)
	if key in wishlist:
		wishlist.remove(key)
		request.session['wishlist'] = wishlist
		request.session.modified = True
	# AJAX support
	if request.headers.get('x-requested-with') == 'XMLHttpRequest':
		return JsonResponse({'removed': True, 'id': pk})
	next_url = request.POST.get('next') or request.META.get('HTTP_REFERER') or reverse('app1:wishlist')
	return redirect(next_url)


@require_POST
def clear_wishlist(request):
	request.session.pop('wishlist', None)
	request.session.modified = True
	return redirect('app1:wishlist')


def admin_dashboard(request):
	return render(request, 'admin.html')


def admin_products(request):
	# List products and provide add form
	q = request.GET.get('q', '').strip()
	products = Product.objects.select_related('category').all()
	if q:
		# basic search on name and description (case-insensitive)
		from django.db.models import Q
		products = products.filter(Q(name__icontains=q) | Q(description__icontains=q) | Q(category__name__icontains=q))
	form = ProductForm()
	categories = Category.objects.all()
	return render(request, 'admin-products.html', {'products': products, 'form': form, 'categories': categories, 'q': q})


def admin_product_add(request):
	if request.method == 'POST':
		form = ProductForm(request.POST, request.FILES)
		if form.is_valid():
			form.save()
			return redirect('app1:admin-products')
	return redirect('app1:admin-products')


def admin_product_edit(request, pk):
	product = get_object_or_404(Product, pk=pk)
	if request.method == 'POST':
		form = ProductForm(request.POST, request.FILES, instance=product)
		if form.is_valid():
			form.save()
			return redirect('app1:admin-products')
	else:
		form = ProductForm(instance=product)
	return render(request, 'admin-product-edit.html', {'form': form, 'product': product})


def admin_product_delete(request, pk):
	product = get_object_or_404(Product, pk=pk)
	if request.method == 'POST':
		product.delete()
	return redirect('app1:admin-products')


def admin_orders(request):
	# pass real orders to admin orders template
	from .models import Order
	orders = Order.objects.prefetch_related('items__product').all()
	# materialize items into a list attribute to avoid calling manager methods in template
	orders_list = []
	for o in orders:
		# ensure items are ordered/prefetched and expose under a safe public name
		o.items_list = list(o.items.all())
		orders_list.append(o)
	return render(request, 'admin-orders.html', {'orders': orders_list})


def admin_order_update(request, pk):
	from .models import Order
	order = get_object_or_404(Order, pk=pk)
	if request.method == 'POST':
		status = request.POST.get('status')
		if status in dict(Order.STATUS_CHOICES):
			order.status = status
			order.save()
	return redirect('app1:admin-orders')
