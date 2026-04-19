from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
from datetime import datetime
from uuid import uuid4


def generate_uuid() -> str:
    return str(uuid4())


class Candidate(BaseModel):
    id: str = Field(default_factory=generate_uuid)
    name: str
    votes: int = 0


class ElectionCreate(BaseModel):
    title: str
    description: str
    candidates: List[str]
    start_time: datetime
    end_time: datetime

    @field_validator("candidates")
    @classmethod
    def validate_candidates(cls, v):
        if len(v) < 2:
            raise ValueError("At least 2 candidates are required")
        return v

    @field_validator("end_time")
    @classmethod
    def validate_end_time(cls, v, info):
        if "start_time" in info.data and v <= info.data["start_time"]:
            raise ValueError("End time must be after start time")
        return v


class ElectionResponse(BaseModel):
    id: str
    title: str
    description: str
    candidates: List[Candidate]
    start_time: datetime
    end_time: datetime
    status: str
    total_votes: int
    created_at: datetime


class ElectionDetailResponse(ElectionResponse):
    has_voted: bool = False


class VoteCreate(BaseModel):
    candidate_id: str


class VoteRecord(BaseModel):
    id: str = Field(default_factory=generate_uuid)
    election_id: str
    candidate_id: str
    ip_hash: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now())


class StatsResponse(BaseModel):
    active_elections: int
    scheduled_elections: int
    total_votes: int
