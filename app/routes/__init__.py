# app/api/__init__.py

from fastapi import APIRouter
from .auth_routes import router as auth_router
from .machines_routes import router as machines_router
from .images_routes import router as images_router
from .testimonials_routes import router as testimonials_router
from .faqs_routes import router as faqs_router
from .customers_routes import router as customers_router
from .sales_routes import router as sales_router
from .service_records_routes import router as service_records_router
from .warranties_routes import router as warranties_router

router = APIRouter()

router.include_router(auth_router, prefix="/api", tags=["Auth"])
router.include_router(machines_router, prefix="/api/machines", tags=["Machines"])
router.include_router(images_router, prefix="/api/images", tags=["Images"])
router.include_router(testimonials_router, prefix="/api/testimonials", tags=["Testimonials"])
router.include_router(faqs_router, prefix="/api/faqs", tags=["FAQs"])
router.include_router(customers_router, prefix="/api/customers", tags=["Customers"])
router.include_router(sales_router, prefix="/api/sales", tags=["Sales"])
router.include_router(service_records_router, prefix="/api/service_records", tags=["Service Records"])
router.include_router(warranties_router, prefix="/api/warranties", tags=["Warranties"])