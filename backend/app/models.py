from app import db
from datetime import datetime
import mongoengine as me

class Product(db.Document):
    sku = me.StringField(unique=True, required=True)
    name = me.StringField(required=True)
    category = me.StringField()
    price = me.FloatField(default=0.0)
    quantity = me.IntField(default=0)
    threshold = me.IntField(default=10)
    created_at = me.DateTimeField(default=datetime.utcnow)

    meta = {'collection': 'products'}

    def __repr__(self):
        return f'<Product {self.sku}: {self.name}>'

class Transaction(db.Document):
    product = me.ReferenceField(Product, reverse_delete_rule=me.CASCADE, required=True)
    type = me.StringField(required=True, choices=['IN', 'OUT'])
    quantity = me.IntField(required=True)
    notes = me.StringField()
    timestamp = me.DateTimeField(default=datetime.utcnow)

    meta = {'collection': 'transactions'}

    def __repr__(self):
        return f'<Transaction {self.type} {self.quantity} for Product {self.product.name}>'
