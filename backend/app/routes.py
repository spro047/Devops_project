from flask import Blueprint, request, jsonify
from app import db
from app.models import Product, Transaction, Batch, DispatchQueue
from datetime import datetime
import uuid

main = Blueprint('main', __name__)

# Constants for Warehouse
MAX_WAREHOUSE_CAPACITY = 10000

def get_status(quantity, threshold):
    if quantity == 0:
        return "Out of Stock"
    elif quantity <= threshold:
        return "Low Stock"
    else:
        return "In Stock"

@main.route('/api/health')
def health():
    return jsonify({'status': 'running'})

@main.route('/api/dashboard')
def dashboard():
    products = Product.objects.all()
    current_stock = sum(p.quantity for p in products)
    capacity_usage = (current_stock / MAX_WAREHOUSE_CAPACITY) * 100
    low_stock_count = len([p for p in products if 0 < p.quantity <= p.threshold])
    out_of_stock_count = len([p for p in products if p.quantity == 0])
    
    return jsonify({
        'total_items': len(products),
        'total_stock': current_stock,
        'capacity_usage_percent': round(capacity_usage, 2),
        'low_stock_count': low_stock_count,
        'out_of_stock_count': out_of_stock_count,
        'recent_products': [
            {
                'id': str(p.id),
                'sku': p.sku,
                'name': p.name,
                'zone': p.zone,
                'quantity': p.quantity,
                'status': get_status(p.quantity, p.threshold)
            } for p in products[:10]
        ]
    })

@main.route('/api/warehouse/status')
def warehouse_status():
    products = Product.objects.all()
    current_stock = sum(p.quantity for p in products)
    capacity_usage = (current_stock / MAX_WAREHOUSE_CAPACITY) * 100
    
    # Stock Aging (Simplified: days since oldest batch)
    aging_data = []
    for p in products:
        if p.batches:
            oldest_batch = min(p.batches, key=lambda b: b.arrival_date)
            days_in_stock = (datetime.utcnow() - oldest_batch.arrival_date).days
            aging_data.append({
                'name': p.name,
                'sku': p.sku,
                'days': days_in_stock
            })

    return jsonify({
        'total_stock': current_stock,
        'max_capacity': MAX_WAREHOUSE_CAPACITY,
        'capacity_usage_percent': round(capacity_usage, 2),
        'aging_report': aging_data
    })

@main.route('/api/products')
def list_products():
    products = Product.objects.all()
    return jsonify([
        {
            'id': str(p.id),
            'sku': p.sku,
            'name': p.name,
            'category': p.category,
            'price': p.price,
            'quantity': p.quantity,
            'zone': p.zone,
            'damaged_quantity': p.damaged_quantity,
            'status': get_status(p.quantity, p.threshold),
            'batches': [
                {
                    'batch_id': b.batch_id,
                    'quantity': b.quantity,
                    'arrival_date': b.arrival_date.isoformat(),
                    'supplier': b.supplier
                } for b in p.batches
            ]
        } for p in products
    ])

@main.route('/api/product', methods=['POST'])
def add_product():
    data = request.get_json()
    sku = data.get('sku')
    name = data.get('name')
    category = data.get('category')
    
    if not sku or not name:
        return jsonify({'error': 'SKU and Name are required'}), 400

    if Product.objects(sku=sku).first():
        return jsonify({'error': 'SKU already exists!'}), 400

    try:
        price = float(data.get('price') or 0.0)
    except ValueError:
        price = 0.0

    try:
        quantity = int(data.get('quantity') or 0)
    except ValueError:
        quantity = 0

    try:
        threshold = int(data.get('threshold') or 10)
    except ValueError:
        threshold = 10

    zone = data.get('zone', 'Zone A')
    batch_id = data.get('batch_id') or str(uuid.uuid4())[:8].upper()
    arrival_date_str = data.get('arrival_date')
    
    if arrival_date_str:
        try:
            arrival_date = datetime.fromisoformat(arrival_date_str)
        except ValueError:
            arrival_date = datetime.utcnow()
    else:
        arrival_date = datetime.utcnow()

    new_product = Product(sku=sku, name=name, category=category, 
                          price=price, quantity=quantity, threshold=threshold,
                          zone=zone)
    
    if quantity > 0:
        initial_batch = Batch(
            batch_id=batch_id,
            quantity=quantity,
            arrival_date=arrival_date,
            supplier=data.get('supplier', 'Initial Stock')
        )
        new_product.batches.append(initial_batch)
    
    new_product.save()
    
    if quantity > 0:
        transaction = Transaction(product=new_product, type='RECEIVE', quantity=quantity, notes=f'Initial warehouse entry. Batch: {batch_id}')
        transaction.save()
    
    return jsonify({'message': 'Product registered and stored in warehouse successfully!'}), 201

@main.route('/api/products/<string:product_id>', methods=['PUT'])
def update_product(product_id):
    product = Product.objects.get_or_404(id=product_id)
    data = request.get_json()
    
    product.name = data.get('name', product.name)
    product.category = data.get('category', product.category)
    product.price = float(data.get('price', product.price))
    product.threshold = int(data.get('threshold', product.threshold))
    product.save()
    
    return jsonify({'message': 'Product updated successfully!'})

@main.route('/api/products/<string:product_id>', methods=['DELETE'])
def delete_product(product_id):
    product = Product.objects.get_or_404(id=product_id)
    product.delete()
    return jsonify({'message': 'Product deleted successfully!'})

@main.route('/api/receive', methods=['POST'])
def receive_shipment():
    data = request.get_json()
    sku = data.get('sku')
    quantity = int(data.get('quantity', 0))
    supplier = data.get('supplier', 'Unknown')
    
    product = Product.objects(sku=sku).first()
    if not product:
        return jsonify({'error': 'Product not found. Register product first.'}), 404

    # Check capacity
    current_total = sum(p.quantity for p in Product.objects.all())
    if current_total + quantity > MAX_WAREHOUSE_CAPACITY:
        return jsonify({'error': 'Warehouse capacity exceeded!'}), 400

    # Create new batch
    new_batch = Batch(
        batch_id=str(uuid.uuid4())[:8].upper(),
        quantity=quantity,
        arrival_date=datetime.utcnow(),
        supplier=supplier
    )
    
    product.batches.append(new_batch)
    product.quantity += quantity
    product.save()

    transaction = Transaction(
        product=product,
        type='RECEIVE',
        quantity=quantity,
        notes=f"Shipment from {supplier}. Batch: {new_batch.batch_id}"
    )
    transaction.save()

    return jsonify({'message': 'Shipment received successfully', 'batch_id': new_batch.batch_id})

@main.route('/api/request', methods=['POST'])
def request_stock():
    data = request.get_json()
    sku = data.get('sku')
    store_name = data.get('store_name')
    quantity = int(data.get('quantity', 0))
    priority = int(data.get('priority', 1)) # 1: Low, 2: Med, 3: High

    product = Product.objects(sku=sku).first()
    if not product:
        return jsonify({'error': 'Product not found'}), 404

    request_item = DispatchQueue(
        product=product,
        request_id=str(uuid.uuid4())[:8].upper(),
        store_name=store_name,
        quantity=quantity,
        priority=priority
    )
    request_item.save()

    return jsonify({'message': 'Request added to dispatch queue', 'request_id': request_item.request_id})

@main.route('/api/dispatch/process', methods=['POST'])
def process_dispatch():
    # Process highest priority oldest requests first
    queue = DispatchQueue.objects(status='Pending').order_by('-priority', 'created_at')
    
    processed = 0
    errors = []

    for req in queue:
        product = req.product
        if product.quantity >= req.quantity:
            # Simple FIFO for batches
            remaining_to_dispatch = req.quantity
            product.batches.sort(key=lambda b: b.arrival_date) # Oldest first
            
            for batch in product.batches:
                if remaining_to_dispatch <= 0: break
                
                if batch.quantity >= remaining_to_dispatch:
                    batch.quantity -= remaining_to_dispatch
                    remaining_to_dispatch = 0
                else:
                    remaining_to_dispatch -= batch.quantity
                    batch.quantity = 0
            
            # Clean up empty batches
            product.batches = [b for b in product.batches if b.quantity > 0]
            product.quantity -= req.quantity
            product.save()

            req.status = 'Dispatched'
            req.save()

            transaction = Transaction(
                product=product,
                type='DISPATCH',
                quantity=req.quantity,
                notes=f"Dispatched to {req.store_name} (Priority {req.priority})"
            )
            transaction.save()
            processed += 1
        else:
            errors.append(f"Insufficient stock for request {req.request_id} ({product.name})")

    return jsonify({'processed': processed, 'errors': errors})

@main.route('/api/damage', methods=['POST'])
def mark_damage():
    data = request.get_json()
    sku = data.get('sku')
    quantity = int(data.get('quantity', 0))
    notes = data.get('notes', 'Damaged stock found')

    product = Product.objects(sku=sku).first()
    if not product or product.quantity < quantity:
        return jsonify({'error': 'Invalid SKU or insufficient quantity'}), 400

    # Reduce from batches (FIFO)
    remaining = quantity
    product.batches.sort(key=lambda b: b.arrival_date)
    for batch in product.batches:
        if remaining <= 0: break
        if batch.quantity >= remaining:
            batch.quantity -= remaining
            remaining = 0
        else:
            remaining -= batch.quantity
            batch.quantity = 0
            
    product.batches = [b for b in product.batches if b.quantity > 0]
    product.quantity -= quantity
    product.damaged_quantity += quantity
    product.save()

    transaction = Transaction(
        product=product,
        type='DAMAGE',
        quantity=quantity,
        notes=notes
    )
    transaction.save()

    return jsonify({'message': 'Waste stock recorded successfully'})

@main.route('/api/dispatch/queue')
def get_dispatch_queue():
    queue = DispatchQueue.objects.order_by('-priority', 'created_at').all()
    return jsonify([
        {
            'id': str(q.id),
            'request_id': q.request_id,
            'product_name': q.product.name,
            'sku': q.product.sku,
            'store_name': q.store_name,
            'quantity': q.quantity,
            'priority': q.priority,
            'status': q.status,
            'created_at': q.created_at.isoformat()
        } for q in queue
    ])

@main.route('/api/transactions')
def get_transactions():
    transactions = Transaction.objects.order_by('-timestamp').all()
    return jsonify([
        {
            'id': str(t.id),
            'product_name': t.product.name,
            'sku': t.product.sku,
            'type': t.type,
            'quantity': t.quantity,
            'notes': t.notes,
            'timestamp': t.timestamp.isoformat()
        } for t in transactions
    ])
