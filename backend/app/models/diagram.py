import json
import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean, Text, TypeDecorator
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class TextJSON(TypeDecorator):
    """Stores JSON as TEXT — compatible with CockroachDB + asyncpg."""
    impl = Text
    cache_ok = True

    def process_bind_param(self, value, dialect):
        return json.dumps(value) if value is not None else None

    def process_result_value(self, value, dialect):
        return json.loads(value) if value is not None else None


class Diagram(Base):
    __tablename__ = "diagrams"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    owner_id = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False, default="Untitled Diagram")
    description = Column(Text, nullable=True)
    csp = Column(String, nullable=False, default="aws")
    graph_data = Column(TextJSON, nullable=False, default=dict)
    thumbnail_url = Column(String, nullable=True)
    is_public = Column(Boolean, default=False)
    share_token = Column(String, nullable=True, unique=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    owner = relationship("User", back_populates="diagrams")
    versions = relationship("DiagramVersion", back_populates="diagram", cascade="all, delete-orphan")


class DiagramVersion(Base):
    __tablename__ = "diagram_versions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    diagram_id = Column(String, ForeignKey("diagrams.id"), nullable=False)
    graph_data = Column(TextJSON, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    diagram = relationship("Diagram", back_populates="versions")
