import pytest
from inventory_service.service import InventoryService


def test_basic_reserve_commit_release():
    svc = InventoryService()
    sku = "TSHIRT-01"
    loc = "DC-1"

    # add stock
    svc.add_stock(sku, loc, 10)
    assert svc.get_on_hand(sku, loc) == 10
    assert svc.get_available(sku, loc) == 10

    # reserve 3
    ok, msg = svc.reserve("r1", sku, loc, 3)
    assert ok
    assert svc.get_reserved(sku, loc) == 3
    assert svc.get_available(sku, loc) == 7

    # commit
    ok, msg = svc.commit("r1")
    assert ok
    assert svc.get_on_hand(sku, loc) == 7

    # release after commit should fail
    ok, msg = svc.release("r1")
    assert not ok


def test_idempotent_reserve():
    svc = InventoryService()
    sku = "HOODIE-02"
    loc = "Store-5"
    svc.add_stock(sku, loc, 5)

    ok, msg = svc.reserve("r-id", sku, loc, 2)
    assert ok
    # second call with same reservation id should be idempotent and return success
    ok, msg = svc.reserve("r-id", sku, loc, 2)
    assert ok


def test_insufficient_stock():
    svc = InventoryService()
    sku = "JEANS-09"
    loc = "DC-9"
    svc.add_stock(sku, loc, 1)

    ok, msg = svc.reserve("r2", sku, loc, 2)
    assert not ok
