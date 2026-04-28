from flask import Blueprint, request, jsonify
from app import db
from app.models import Product, Transaction

main = Blueprint('main', __name__)

@main.route('/api/dashboard')
def dashboard():
    products = Product.query.all()
    total_items = sum(p.quantity for p in products)
    total_value = sum(p.quantity * p.price for p in products)
    low_stock_items = [p for p in products if p.quantity <= p.threshold]
    
    return jsonify({
        'total_items': total_items,
        'total_value': total_value,
        'low_stock_count': len(low_stock_items),
        'recent_products': [
            {
                'id': p.id,
                'sku': p.sku,
                'name': p.name,
                'category': p.category,
                'quantity': p.quantity,
                'threshold': p.threshold,
                'price': p.price
            } for p in products[:10]
        ]
    })

@main.route('/api/products')
def list_products():
    products = Product.query.all()
    return jsonify([
        {
            'id': p.id,
            'sku': p.sku,
            'name': p.name,
            'category': p.category,
            'price': p.price,
            'quantity': p.quantity,
            'threshold': p.threshold
        } for p in products
    ])

@main.route('/api/product', methods=['POST'])
def add_product():
    data = request.get_json()
    sku = data.get('sku')
    name = data.get('name')
    category = data.get('category')
    price = float(data.get('price', 0))
    quantity = int(data.get('quantity', 0))
    threshold = int(data.get('threshold', 10))

    if Product.query.filter_by(sku=sku).first():
        return jsonify({'error': 'SKU already exists!'}), 400

    new_product = Product(sku=sku, name=name, category=category, 
                          price=price, quantity=quantity, threshold=threshold)
    db.session.add(new_product)
    db.session.commit()
    
    return jsonify({'message': 'Product added successfully!'}), 201

@main.route('/api/inventory/adjust/<int:product_id>', methods=['POST'])
def adjust_inventory(product_id):
    product = Product.query.get_or_404(product_id)
    data = request.get_json()
    adj_type = data.get('type')  # 'IN' or 'OUT'
    amount = int(data.get('amount', 0))
    notes = data.get('notes', '')

    if adj_type == 'OUT' and product.quantity < amount:
        return jsonify({'error': 'Not enough stock!'}), 400
    
    if adj_type == 'IN':
        product.quantity += amount
    else:
        product.quantity -= amount
    
    transaction = Transaction(product_id=product.id, type=adj_type, quantity=amount, notes=notes)
    db.session.add(transaction)
    db.session.commit()
    
    return jsonify({'message': 'Inventory adjusted!', 'new_quantity': product.quantity})

@main.route('/api/transactions')
def get_transactions():
    transactions = Transaction.query.order_by(Transaction.timestamp.desc()).all()
    return jsonify([
        {
            'id': t.id,
            'product_name': t.product.name,
            'sku': t.product.sku,
            'type': t.type,
            'quantity': t.quantity,
            'notes': t.notes,
            'timestamp': t.timestamp.isoformat()
        } for t in transactions
    ])
