def cart_item_count(request):
    """Return the total number of items in the session cart.

    Exposes `cart_item_count` to all templates.
    The session cart is expected to be a dict mapping product PKs to quantities.
    """
    cart = request.session.get('cart', {})
    total = 0
    try:
        if isinstance(cart, dict):
            for v in cart.values():
                try:
                    total += int(v)
                except Exception:
                    # if value can't be parsed, ignore it
                    continue
    except Exception:
        total = 0
    return {'cart_item_count': total}
