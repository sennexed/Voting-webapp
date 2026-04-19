# Pydantic Models

from pydantic import BaseModel

class Election(BaseModel):
    id: int
    name: str
    date: str

class Vote(BaseModel):
    election_id: int
    voter_id: int
    choice: str

