from pydantic import BaseModel

class Candidate(BaseModel):
    id: int
    name: str
    party: str

class ElectionCreate(BaseModel):
    title: str
    date: str

class ElectionResponse(BaseModel):
    id: int
    title: str
    date: str
    candidates: list[Candidate]

class ElectionDetailResponse(BaseModel):
    id: int
    title: str
    date: str
    candidates: list[Candidate]
    statistics: dict

class VoteCreate(BaseModel):
    candidate_id: int
    election_id: int

class VoteRecord(BaseModel):
    id: int
    candidate_id: int
    election_id: int

class StatsResponse(BaseModel):
    election_id: int
    total_votes: int
    results: dict