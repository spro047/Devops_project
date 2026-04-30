from flask import Blueprint, request, jsonify
from app import db
from app.models import Product, Transaction, Batch, DispatchQueue
from datetime import datetime
import uuid
import threading
import time

ACTIVE_SIMULATIONS = set()

def simulate_delivery(request_id):
    if request_id in ACTIVE_SIMULATIONS: return
    ACTIVE_SIMULATIONS.add(request_id)
    
    try:
        req = DispatchQueue.objects(id=request_id).first()
        if not req: return

        # Step 0 & 1: Order Created & Loading (10 seconds total)
        if req.status == 'Pending':
            req.current_location = 'Warehouse (Order Processing)'
            req.save()
            time.sleep(5)
            req.status = 'Approved'
            req.current_location = 'Warehouse Dock (Loading)'
            req.save()
            time.sleep(5)

        # Step 2: Final Checks (5 seconds)
        if req.status == 'Approved':
            req.current_location = 'Security Gate (Final Exit)'
            req.save()
            time.sleep(5)
            # Now set to Dispatched ONLY when movement is about to begin
            req.status = 'Dispatched'
            req.save()
        
        # Step 3: In Transit (Actually Moving)
        if req.status == 'Dispatched':
            req.current_location = 'On Main Highway'
            steps = 5
            for i in range(1, steps + 1):
                # Interpolate between Warehouse (12.9716, 77.5946) and Store (12.2958, 76.6394)
                req.lat = 12.9716 + (12.2958 - 12.9716) * (i / steps)
                req.lng = 77.5946 + (76.6394 - 77.5946) * (i / steps)
                
                if i < 2: req.current_location = 'Outer Ring Road'
                elif i < 4: req.current_location = 'Industrial Bypass'
                else: req.current_location = 'Approaching City Hub'
                
                req.save()
                time.sleep(3) # Wait AFTER saving to ensure movement reflects in polls

        # Step 4: Arrived at Destination (5 seconds)
        req.current_location = 'Destination Hub Dock'
        req.save()
        time.sleep(5)

        # Step 5: Delivered
        req.status = 'Completed'
        req.current_location = f"Delivered at {req.store_name}"
        req.lat = req.dest_lat
        req.lng = req.dest_lng
        req.save()
    finally:
        ACTIVE_SIMULATIONS.discard(request_id)

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

# Demo Data Initialization
def init_demo_data():
    demo = DispatchQueue.objects(request_id="DEMO-777").first()
    if not demo:
        p = Product.objects.first()
        if p:
            demo = DispatchQueue(
                product=p,
                request_id="DEMO-777",
                store_name="City Center Hub",
                quantity=25,
                priority=2,
                status="Pending",
                estimated_delivery="2 hours",
                current_location="Warehouse"
            )
            demo.save()
    elif demo.status == 'Completed':
        # Reset for repeated demos
        demo.status = 'Pending'
        demo.current_location = 'Warehouse'
        demo.lat = 12.9716
        demo.lng = 77.5946
        demo.save()

@main.route('/api/health')
def health():
    init_demo_data()
    return jsonify({'status': 'running'})

@main.route('/api/dashboard')
def dashboard():
    init_demo_data()
    products = Product.objects.all()
    recent_tx = Transaction.objects.order_by('-timestamp')[:5]
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
        ],
        'recent_transactions': [
            {
                'id': str(t.id),
                'type': t.type,
                'notes': t.notes,
                'timestamp': t.timestamp.isoformat()
            } for t in recent_tx
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
            days_in_stock = max(0, (datetime.utcnow() - oldest_batch.arrival_date).days)
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
    
    # New Tracking Fields
    enable_tracking = data.get('enableTracking', False)
    destination = data.get('destination', 'Store A')
    dispatch_type = data.get('dispatchType', 'Later')
    est_delivery = data.get('estDelivery', '1 day')
    
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

    # Create Tracking Entry if requested
    if enable_tracking:
        tracking_id = data.get('tracking_id') or f"TRK-{uuid.uuid4().hex[:5].upper()}"
        req = DispatchQueue(
            product=product,
            request_id=tracking_id,
            store_name=destination,
            quantity=quantity,
            status='Pending',
            estimated_delivery=est_delivery
        )
        req.save()

        if dispatch_type == 'Immediate':
            # Reduce stock immediately as it's going out
            product.quantity -= quantity
            product.save()
            
            threading.Thread(target=simulate_delivery, args=(str(req.id),)).start()
            return jsonify({
                'message': f'Received and Dispatched immediately! Tracking ID: {tracking_id}',
                'tracking_id': tracking_id,
                'batch_id': new_batch.batch_id
            })

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

@main.route('/api/track/<string:request_id>')
def track_shipment(request_id):
    clean_id = request_id.strip().upper()
    req = DispatchQueue.objects(request_id__iexact=clean_id).first()
    if not req:
        return jsonify({'error': 'Tracking ID not found'}), 404
        
    # AUTO-START SIMULATION: If it's the demo and NOT running, RESET it to start from zero!
    is_running = str(req.id) in ACTIVE_SIMULATIONS
    if clean_id == "DEMO-777" and not is_running:
        req.status = 'Pending'
        req.current_location = 'Warehouse'
        req.lat = 12.9716
        req.lng = 77.5946
        req.save()
        threading.Thread(target=simulate_delivery, args=(str(req.id),)).start()
    elif (req.status in ['Pending', 'Approved']) and not is_running:
        threading.Thread(target=simulate_delivery, args=(str(req.id),)).start()
        
    # Generate realistic history based on current status
    history = [{'time': req.created_at.isoformat(), 'status': 'Order Created'}]
    
    if req.status in ['Approved', 'Dispatched', 'Completed']:
        history.append({'time': (req.created_at).isoformat(), 'status': 'Loading at Warehouse'})
    
    if req.status in ['Dispatched', 'Completed']:
        history.append({'time': (req.created_at).isoformat(), 'status': 'Dispatched from Warehouse'})
        history.append({'time': (req.created_at).isoformat(), 'status': 'In Transit'})

    if req.status == 'Completed':
        history.append({'time': (req.created_at).isoformat(), 'status': 'Delivered Successfully'})

    return jsonify({
        'tracking_id': req.request_id,
        'product_name': req.product.name,
        'quantity': req.fulfilled_quantity or req.quantity,
        'status': req.status,
        'store_name': req.store_name,
        'source': req.source,
        'current_location': req.current_location,
        'lat': req.lat,
        'lng': req.lng,
        'dest_lat': req.dest_lat,
        'dest_lng': req.dest_lng,
        'estimated_delivery': req.estimated_delivery or "Pending Approval",
        'history': history
    })

@main.route('/api/warehouse/move', methods=['POST'])
def move_zone():
    data = request.get_json()
    sku = data.get('sku')
    new_zone = data.get('zone')
    
    product = Product.objects(sku=sku).first()
    if not product:
        return jsonify({'error': 'Product not found'}), 404
        
    old_zone = product.zone
    product.zone = new_zone
    product.save()
    
    transaction = Transaction(
        product=product,
        type='ADJUST',
        quantity=0,
        notes=f"Zone transfer: {old_zone} -> {new_zone}"
    )
    transaction.save()
    
    return jsonify({'message': f'Product moved to {new_zone} successfully'})

@main.route('/api/warehouse/clear-old', methods=['POST'])
def clear_old_stock():
    data = request.get_json()
    sku = data.get('sku')
    
    product = Product.objects(sku=sku).first()
    if not product or not product.batches:
        return jsonify({'error': 'No stock to clear'}), 400
        
    # Find oldest batch
    product.batches.sort(key=lambda b: b.arrival_date)
    oldest = product.batches[0]
    clear_qty = oldest.quantity
    
    product.batches.pop(0)
    product.quantity -= clear_qty
    product.save()
    
    transaction = Transaction(
        product=product,
        type='ADJUST',
        quantity=clear_qty,
        notes=f"Old stock clearance (Batch: {oldest.batch_id})"
    )
    transaction.save()
    
    return jsonify({'message': f'Cleared {clear_qty} units of old stock'})

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

@main.route('/api/sell', methods=['POST'])
def direct_sell():
    data = request.get_json()
    sku = data.get('sku')
    quantity = int(data.get('quantity', 0))

    product = Product.objects(sku=sku).first()
    if not product or product.quantity < quantity:
        return jsonify({'error': 'Invalid SKU or insufficient stock'}), 400

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
    product.save()

    transaction = Transaction(
        product=product,
        type='DISPATCH',
        quantity=quantity,
        notes='Direct sale from dashboard'
    )
    transaction.save()

    return jsonify({'message': 'Sale successful, stock updated'})

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
            'fulfilled_quantity': q.fulfilled_quantity,
            'priority': q.priority,
            'status': q.status,
            'created_at': q.created_at.isoformat(),
            'available_stock': q.product.quantity
        } for q in queue
    ])

@main.route('/api/dispatch/<string:request_id>', methods=['PUT'])
def update_dispatch(request_id):
    data = request.get_json()
    action = data.get('action') # 'APPROVE', 'REJECT', 'FULFILL'
    
    req = DispatchQueue.objects.get_or_404(id=request_id)
    product = req.product

    if action == 'REJECT':
        req.status = 'Rejected'
        req.save()
        return jsonify({'message': 'Request rejected'})

    if action == 'APPROVE':
        req.status = 'Approved'
        req.save()
        return jsonify({'message': 'Request approved'})

    if action == 'FULFILL':
        fill_qty = int(data.get('quantity', req.quantity))
        
        if product.quantity < fill_qty:
            return jsonify({'error': 'Insufficient warehouse stock'}), 400

        # FIFO reduction
        remaining = fill_qty
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
        product.quantity -= fill_qty
        product.save()

        req.fulfilled_quantity += fill_qty
        if req.fulfilled_quantity >= req.quantity:
            req.status = 'Completed'
        else:
            req.status = 'Dispatched' # Partial fulfillment
        req.save()

        transaction = Transaction(
            product=product,
            type='DISPATCH',
            quantity=fill_qty,
            notes=f"Dispatch to {req.store_name} (Req: {req.request_id})"
        )
        transaction.save()
        
        # Start background simulation
        threading.Thread(target=simulate_delivery, args=(str(req.id),)).start()
        
        return jsonify({
            'message': f'Dispatched {fill_qty} units. Truck is now in transit to {req.store_name}.',
            'status': req.status
        })

    return jsonify({'error': 'Invalid action'}), 400

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
