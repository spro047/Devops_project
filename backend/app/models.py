from app import db
from datetime import datetime
import mongoengine as me

class Batch(me.EmbeddedDocument):
    batch_id = me.StringField(required=True)
    quantity = me.IntField(default=0)
    arrival_date = me.DateTimeField(default=datetime.utcnow)
    supplier = me.StringField()

class Product(db.Document):
    sku = me.StringField(unique=True, required=True)
    name = me.StringField(required=True)
    category = me.StringField()
    price = me.FloatField(default=0.0)
    quantity = me.IntField(default=0)
    threshold = me.IntField(default=10)
    zone = me.StringField(choices=['Zone A', 'Zone B', 'Zone C'], default='Zone A')
    batches = me.EmbeddedDocumentListField(Batch)
    damaged_quantity = me.IntField(default=0)
    created_at = me.DateTimeField(default=datetime.utcnow)

    meta = {'collection': 'products'}

    def __repr__(self):
        return f'<Product {self.sku}: {self.name}>'

class DispatchQueue(db.Document):
    product = me.ReferenceField(Product, required=True)
    request_id = me.StringField(required=True)
    store_name = me.StringField(required=True)
    quantity = me.IntField(required=True)
    fulfilled_quantity = me.IntField(default=0)
    priority = me.IntField(default=1) # 1: Low, 2: Medium, 3: High
    status = me.StringField(default='Pending', choices=['Pending', 'Approved', 'Dispatched', 'Completed', 'Rejected', 'Cancelled'])
    created_at = me.DateTimeField(default=datetime.utcnow)

    meta = {'collection': 'dispatch_queue'}

class Transaction(db.Document):
    product = me.ReferenceField(Product, reverse_delete_rule=me.CASCADE, required=True)
    type = me.StringField(required=True, choices=['RECEIVE', 'DISPATCH', 'DAMAGE', 'ADJUST'])
    quantity = me.IntField(required=True)
    notes = me.StringField()
    timestamp = me.DateTimeField(default=datetime.utcnow)

    meta = {'collection': 'transactions'}

    def __repr__(self):
        return f'<Transaction {self.type} {self.quantity} for Product {self.product.name}>'
