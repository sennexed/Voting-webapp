import hashlib
from datetime import datetime, timezone
from typing import List, Optional
from uuid import uuid4

from fastapi import APIRouter, HTTPException, Request, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from database import get_database
from models import (
    Candidate,
    ElectionCreate,
    ElectionDetailResponse,
    ElectionResponse,
    StatsResponse,
    VoteCreate,
)

router = APIRouter(prefix="/api/elections", tags=["elections"])


def get_client_ip(request: Request) -> str:
    """Extract client IP from headers or connection"""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip
    
    if request.client:
        return request.client.host
    
    return "unknown"


def hash_ip(ip: str, election_id: str) -> str:
    """Hash IP with election ID using SHA256"""
    return hashlib.sha256(f"{ip}{election_id}".encode()).hexdigest()


def compute_status(start_time: datetime, end_time: datetime) -> str:
    """Compute election status based on current time"""
    now = datetime.now(timezone.utc)
    
    # Ensure times are timezone-aware
    if start_time.tzinfo is None:
        start_time = start_time.replace(tzinfo=timezone.utc)
    if end_time.tzinfo is None:
        end_time = end_time.replace(tzinfo=timezone.utc)
    
    if now < start_time:
        return "upcoming"
    elif now >= end_time:
        return "ended"
    else:
        return "live"


async def purge_ip_hashes_if_ended(db: AsyncIOMotorDatabase, election_id: str, status: str):
    """Clear IP hashes when election ends (privacy preservation)"""
    if status == "ended":
        await db.votes.update_many(
            {"election_id": election_id, "ip_hash": {"$ne": None}},
            {"$set": {"ip_hash": None}}
        )


@router.post("", response_model=ElectionResponse, status_code=status.HTTP_201_CREATED)
async def create_election(election: ElectionCreate):
    """Create a new election"""
    db = get_database()
    
    election_id = str(uuid4())
    now = datetime.now(timezone.utc)
    
    candidates = [
        Candidate(id=str(uuid4()), name=name, votes=0).model_dump()
        for name in election.candidates
    ]
    
    election_doc = {
        "id": election_id,
        "title": election.title,
        "description": election.description,
        "candidates": candidates,
        "start_time": election.start_time.isoformat(),
        "end_time": election.end_time.isoformat(),
        "created_at": now.isoformat(),
    }
    
    await db.elections.insert_one(election_doc)
    
    status = compute_status(election.start_time, election.end_time)
    
    return ElectionResponse(
        id=election_id,
        title=election.title,
        description=election.description,
        candidates=[Candidate(**c) for c in candidates],
        start_time=election.start_time,
        end_time=election.end_time,
        status=status,
        total_votes=0,
        created_at=now,
    )


@router.get("", response_model=List[ElectionResponse])
async def list_elections():
    """List all elections with computed status and total votes"""
    db = get_database()
    
    elections = []
    cursor = db.elections.find({})
    
    async for doc in cursor:
        start_time = datetime.fromisoformat(doc["start_time"])
        end_time = datetime.fromisoformat(doc["end_time"])
        created_at = datetime.fromisoformat(doc["created_at"])
        
        status = compute_status(start_time, end_time)
        
        # Purge IP hashes if ended
        await purge_ip_hashes_if_ended(db, doc["id"], status)
        
        total_votes = sum(c["votes"] for c in doc["candidates"])
        
        elections.append(ElectionResponse(
            id=doc["id"],
            title=doc["title"],
            description=doc["description"],
            candidates=[Candidate(**c) for c in doc["candidates"]],
            start_time=start_time,
            end_time=end_time,
            status=status,
            total_votes=total_votes,
            created_at=created_at,
        ))
    
    return elections


@router.get("/stats", response_model=StatsResponse)
async def get_stats():
    """Get global statistics"""
    db = get_database()
    
    active = 0
    scheduled = 0
    total_votes = 0
    
    cursor = db.elections.find({})
    async for doc in cursor:
        start_time = datetime.fromisoformat(doc["start_time"])
        end_time = datetime.fromisoformat(doc["end_time"])
        status = compute_status(start_time, end_time)
        
        if status == "live":
            active += 1
        elif status == "upcoming":
            scheduled += 1
        
        total_votes += sum(c["votes"] for c in doc["candidates"])
    
    return StatsResponse(
        active_elections=active,
        scheduled_elections=scheduled,
        total_votes=total_votes,
    )


@router.get("/{election_id}", response_model=ElectionDetailResponse)
async def get_election(election_id: str, request: Request):
    """Get election details with vote status for requester"""
    db = get_database()
    
    doc = await db.elections.find_one({"id": election_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Election not found")
    
    start_time = datetime.fromisoformat(doc["start_time"])
    end_time = datetime.fromisoformat(doc["end_time"])
    created_at = datetime.fromisoformat(doc["created_at"])
    
    status = compute_status(start_time, end_time)
    
    # Purge IP hashes if ended
    await purge_ip_hashes_if_ended(db, election_id, status)
    
    total_votes = sum(c["votes"] for c in doc["candidates"])
    
    # Check if requester has voted
    client_ip = get_client_ip(request)
    ip_hash = hash_ip(client_ip, election_id)
    
    existing_vote = await db.votes.find_one({
        "election_id": election_id,
        "ip_hash": ip_hash
    })
    has_voted = existing_vote is not None
    
    return ElectionDetailResponse(
        id=doc["id"],
        title=doc["title"],
        description=doc["description"],
        candidates=[Candidate(**c) for c in doc["candidates"]],
        start_time=start_time,
        end_time=end_time,
        status=status,
        total_votes=total_votes,
        created_at=created_at,
        has_voted=has_voted,
    )


@router.post("/{election_id}/vote", status_code=status.HTTP_200_OK)
async def cast_vote(election_id: str, vote: VoteCreate, request: Request):
    """Cast a vote for a candidate"""
    db = get_database()
    
    # Get election
    doc = await db.elections.find_one({"id": election_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Election not found")
    
    start_time = datetime.fromisoformat(doc["start_time"])
    end_time = datetime.fromisoformat(doc["end_time"])
    status = compute_status(start_time, end_time)
    
    # Check election status
    if status == "upcoming":
        raise HTTPException(
            status_code=400,
            detail="Election has not started yet"
        )
    
    if status == "ended":
        raise HTTPException(
            status_code=400,
            detail="Election has ended"
        )
    
    # Validate candidate exists
    candidate_exists = any(c["id"] == vote.candidate_id for c in doc["candidates"])
    if not candidate_exists:
        raise HTTPException(
            status_code=400,
            detail="Invalid candidate"
        )
    
    # Check for duplicate vote
    client_ip = get_client_ip(request)
    ip_hash = hash_ip(client_ip, election_id)
    
    existing_vote = await db.votes.find_one({
        "election_id": election_id,
        "ip_hash": ip_hash
    })
    
    if existing_vote:
        raise HTTPException(
            status_code=409,
            detail="You have already voted in this election"
        )
    
    # Record vote
    vote_doc = {
        "id": str(uuid4()),
        "election_id": election_id,
        "candidate_id": vote.candidate_id,
        "ip_hash": ip_hash,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    
    await db.votes.insert_one(vote_doc)
    
    # Increment candidate vote count
    await db.elections.update_one(
        {"id": election_id, "candidates.id": vote.candidate_id},
        {"$inc": {"candidates.$.votes": 1}}
    )
    
    return {"message": "Vote cast successfully"}


@router.delete("/{election_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_election(election_id: str):
    """Delete an election and its votes"""
    db = get_database()
    
    result = await db.elections.delete_one({"id": election_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Election not found")
    
    # Delete associated votes
    await db.votes.delete_many({"election_id": election_id})
    
    return None
