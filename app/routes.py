from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
from app import db
from app.models import Product, Transaction

main = Blueprint('main', __name__)

@main.route('/')
def dashboard():
    products = Product.query.all()
    total_items = sum(p.quantity for p in products)
    total_value = sum(p.quantity * p.price for p in products)
    low_stock_items = [p for p in products if p.quantity <= p.threshold]
    
    return render_template('dashboard.html', 
                           products=products, 
                           total_items=total_items, 
                           total_value=total_value, 
                           low_stock_count=len(low_stock_items))

@main.route('/products')
def list_products():
    products = Product.query.all()
    return render_template('products.html', products=products)

@main.route('/product/add', methods=['GET', 'POST'])
def add_product():
    if request.method == 'POST':
        sku = request.form.get('sku')
        name = request.form.get('name')
        category = request.form.get('category')
        price = float(request.form.get('price', 0))
        quantity = int(request.form.get('quantity', 0))
        threshold = int(request.form.get('threshold', 10))

        if Product.query.filter_by(sku=sku).first():
            flash('SKU already exists!', 'danger')
            return redirect(url_for('main.add_product'))

        new_product = Product(sku=sku, name=name, category=category, 
                              price=price, quantity=quantity, threshold=threshold)
        db.session.add(new_product)
        db.session.commit()
        flash('Product added successfully!', 'success')
        return redirect(url_for('main.list_products'))

    return render_template('add_product.html')

@main.route('/inventory/adjust/<int:product_id>', methods=['POST'])
def adjust_inventory(product_id):
    product = Product.query.get_or_404(product_id)
    adj_type = request.form.get('type')  # 'IN' or 'OUT'
    amount = int(request.form.get('amount', 0))
    notes = request.form.get('notes')

    if adj_type == 'OUT' and product.quantity < amount:
        flash('Not enough stock!', 'danger')
    else:
        if adj_type == 'IN':
            product.quantity += amount
        else:
            product.quantity -= amount
        
        transaction = Transaction(product_id=product.id, type=adj_type, quantity=amount, notes=notes)
        db.session.add(transaction)
        db.session.commit()
        flash('Inventory adjusted!', 'success')

    return redirect(url_for('main.dashboard'))
