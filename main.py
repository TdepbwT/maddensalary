import os
import json
from contextlib import asynccontextmanager
from pathlib import Path

import ijson
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

# File paths
BASE_DIR = Path(__file__).parent
TEAMS_FILE = BASE_DIR / "teams.json"
SALARY_INFO_FILE = BASE_DIR / "salary_info.json"
ROSTER_FILE = BASE_DIR / "roster.json"
PLAYER_SALARY_INFO_FILE = BASE_DIR / "player_salary_info.json"


def extract_salary_info() -> dict:
    """
    Stream-parse teams.json and extract salary information for each team.
    Uses ijson for memory-efficient parsing of large JSON files.
    
    Returns:
        dict: Nested structure {teamId: {teamName, abbrName, salary: {...}}}
    """
    salary_data = {}
    
    try:
        with open(TEAMS_FILE, "rb") as f:
            # Use ijson.kvitems to iterate over key-value pairs in the top-level object
            # This streams the data without loading the entire 10.4MB file into memory
            for team_id, team in ijson.kvitems(f, ""):
                # Extract only needed fields
                salary_info = {
                    "teamName": team.get("teamName"),
                    "abbrName": team.get("abbrName"),
                    "salary": {
                        "capRoom": team.get("capRoom"),
                        "capSpent": team.get("capSpent"),
                        "capAvailable": team.get("capAvailable"),
                    }
                }
                
                salary_data[team_id] = salary_info
        
        print(f"✓ Extracted salary info for {len(salary_data)} teams")
        return salary_data
    
    except FileNotFoundError:
        print(f"✗ Error: {TEAMS_FILE} not found")
        raise
    except Exception as e:
        print(f"✗ Error extracting salary data: {e}")
        raise


def save_salary_info(data: dict) -> None:
    """
    Save salary data to JSON file using orjson (fast, efficient serialization).
    
    Args:
        data: Dictionary of salary information
    """
    try:
        with open(SALARY_INFO_FILE, "w", encoding="utf-8") as f:
            # Use stdlib json to avoid native-extension runtime compatibility issues.
            json.dump(data, f, indent=2)
        
        file_size = os.path.getsize(SALARY_INFO_FILE) / 1024  # KB
        print(f"✓ Saved salary_info.json ({file_size:.1f} KB)")
    
    except Exception as e:
        print(f"✗ Error saving salary data: {e}")
        raise


def load_salary_info() -> dict:
    """
    Load pre-generated salary_info.json into memory for fast API queries.
    If file doesn't exist, extract and generate it first.
    
    Returns:
        dict: Salary information for all teams
    """
    if not SALARY_INFO_FILE.exists():
        print("salary_info.json not found. Generating...")
        data = extract_salary_info()
        save_salary_info(data)
        return data
    
    try:
        with open(SALARY_INFO_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"✗ Error loading salary_info.json: {e}")
        raise


def extract_player_salary_info() -> dict:
    """
    Stream-parse roster.json and extract salary information for each player.
    Uses ijson for memory-efficient parsing of large JSON files.
    Groups players by team for easy lookup.
    
    Returns:
        dict: Nested structure {teamId: {playerId: {firstName, lastName, position, salary: {...}}}}
    """
    player_data = {}
    
    try:
        with open(ROSTER_FILE, "rb") as f:
            # Use ijson.items to iterate over array elements
            # This streams the data without loading entire file into memory
            for player in ijson.items(f, "item"):
                team_id = str(player.get("teamId"))
                player_id = str(player.get("rosterId"))
                
                # Initialize team if not yet in dict
                if team_id not in player_data:
                    player_data[team_id] = {}
                
                # Extract only needed salary/contract fields
                player_salary_info = {
                    "firstName": player.get("firstName"),
                    "lastName": player.get("lastName"),
                    "position": player.get("position"),
                    "salary": {
                        "contractSalary": player.get("contractSalary"),
                        "capHit": player.get("capHit"),
                        "contractBonus": player.get("contractBonus"),
                        "contractLength": player.get("contractLength"),
                        "contractYearsLeft": player.get("contractYearsLeft"),
                        "capReleasePenalty": player.get("capReleasePenalty"),
                        "capReleaseNetSavings": player.get("capReleaseNetSavings"),
                    },
                    "status": {
                        "isActive": player.get("isActive"),
                        "isOnIR": player.get("isOnIR"),
                        "isFreeAgent": player.get("isFreeAgent"),
                        "isOnPracticeSquad": player.get("isOnPracticeSquad"),
                    }
                }
                
                player_data[team_id][player_id] = player_salary_info
        
        total_players = sum(len(players) for players in player_data.values())
        print(f"✓ Extracted salary info for {total_players} players across {len(player_data)} teams")
        return player_data
    
    except FileNotFoundError:
        print(f"✗ Error: {ROSTER_FILE} not found")
        raise
    except Exception as e:
        print(f"✗ Error extracting player salary data: {e}")
        raise


def save_player_salary_info(data: dict) -> None:
    """
    Save player salary data to JSON file using orjson (fast, efficient serialization).
    
    Args:
        data: Dictionary of player salary information grouped by team
    """
    try:
        with open(PLAYER_SALARY_INFO_FILE, "w", encoding="utf-8") as f:
            # Use stdlib json to avoid native-extension runtime compatibility issues.
            json.dump(data, f, indent=2)
        
        file_size = os.path.getsize(PLAYER_SALARY_INFO_FILE) / 1024  # KB
        print(f"✓ Saved player_salary_info.json ({file_size:.1f} KB)")
    
    except Exception as e:
        print(f"✗ Error saving player salary data: {e}")
        raise


def load_player_salary_info() -> dict:
    """
    Load pre-generated player_salary_info.json into memory for fast API queries.
    If file doesn't exist, extract and generate it first.
    
    Returns:
        dict: Player salary information grouped by team
    """
    if not PLAYER_SALARY_INFO_FILE.exists():
        print("player_salary_info.json not found. Generating...")
        data = extract_player_salary_info()
        save_player_salary_info(data)
        return data
    
    try:
        with open(PLAYER_SALARY_INFO_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"✗ Error loading player_salary_info.json: {e}")
        raise


# Global variables to hold loaded salary data
salary_data: dict = {}  # Team salary info
player_salary_data: dict = {}  # Player salary info grouped by team


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    FastAPI lifespan context manager.
    Loads salary data on startup, cleans up on shutdown.
    """
    global salary_data, player_salary_data
    
    # Startup
    print("Loading salary data...")
    salary_data = load_salary_info()
    print(f"Loaded {len(salary_data)} teams into memory")
    
    print("Loading player salary data...")
    player_salary_data = load_player_salary_info()
    print(f"Loaded players for {len(player_salary_data)} teams into memory")
    
    yield
    
    # Shutdown
    print("Shutting down API...")


# Initialize FastAPI app with lifespan
app = FastAPI(
    title="Madden Salary API",
    description="API for team and player salary information",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend access
default_allow_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://maddensalary.netlify.app",
]

extra_allow_origins = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=default_allow_origins + [origin for origin in extra_allow_origins if origin not in default_allow_origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/teams/salary", tags=["Salary"])
async def get_all_teams_salary():
    """
    Retrieve salary information for all teams.
    
    Returns:
        dict: All teams with teamName, abbrName, and salary info (capRoom, capSpent, capAvailable)
    """
    return salary_data


@app.get("/teams/search", tags=["Salary"])
async def search_teams_by_name(name: str = Query(..., min_length=2, description="Team name (e.g., 'Chiefs', '49ers', minimum 2 characters, case-insensitive)")):
    """
    Search for teams by name (case-insensitive, partial matching).
    Returns salary information for matching teams.
    
    Args:
        name: Team name or abbreviation (minimum 2 characters)
    
    Returns:
        dict: List of matching teams with their salary info
    
    Examples:
        - /teams/search?name=chiefs → Kansas City Chiefs
        - /teams/search?name=49 → San Francisco 49ers
        - /teams/search?name=bills → Buffalo Bills
    """
    search_term = name.lower().strip()
    matches = []
    
    for team_id, team_info in salary_data.items():
        team_name = team_info.get("teamName", "").lower()
        abbr = team_info.get("abbrName", "").lower()
        
        # Case-insensitive partial match on team name or abbreviation
        if search_term in team_name or search_term in abbr:
            matches.append({
                "teamId": team_id,
                "teamName": team_info.get("teamName"),
                "abbrName": team_info.get("abbrName"),
                "salary": team_info.get("salary")
            })
    
    if not matches:
        raise HTTPException(
            status_code=404,
            detail=f"No teams found matching name: '{name}'"
        )
    
    return {
        "searchTerm": name,
        "resultsFound": len(matches),
        "teams": matches
    }


@app.get("/teams/{team_id}/salary", tags=["Salary"])
async def get_team_salary(team_id: str):
    """
    Retrieve salary information for a specific team.
    
    Args:
        team_id: The team's unique identifier (as string)
    
    Returns:
        dict: Team name, abbreviation, and salary details
    
    Raises:
        HTTPException: 404 if team_id not found
    """
    if team_id not in salary_data:
        raise HTTPException(
            status_code=404,
            detail=f"Team with ID {team_id} not found"
        )
    
    return {
        "teamId": team_id,
        **salary_data[team_id]
    }


@app.get("/teams/{team_id}/players/salary", tags=["Players"])
async def get_team_players_salary(team_id: str):
    """
    Retrieve salary information for all players on a specific team.
    
    Args:
        team_id: The team's unique identifier (as string)
    
    Returns:
        dict: Dictionary of players with their salary info
    
    Raises:
        HTTPException: 404 if team_id not found
    """
    if team_id not in player_salary_data:
        raise HTTPException(
            status_code=404,
            detail=f"Team with ID {team_id} not found"
        )
    
    players = player_salary_data[team_id]
    return {
        "teamId": team_id,
        "totalPlayers": len(players),
        "players": players
    }


@app.get("/players/{player_id}/salary", tags=["Players"])
async def get_player_salary(player_id: str):
    """
    Retrieve salary information for a specific player.
    Searches across all teams to find the player.
    
    Args:
        player_id: The player's unique roster ID (as string)
    
    Returns:
        dict: Player name, position, team, and salary details
    
    Raises:
        HTTPException: 404 if player_id not found
    """
    for team_id, players in player_salary_data.items():
        if player_id in players:
            player = players[player_id]
            return {
                "playerId": player_id,
                "teamId": team_id,
                **player
            }
    
    raise HTTPException(
        status_code=404,
        detail=f"Player with ID {player_id} not found"
    )


@app.get("/players/search", tags=["Players"])
async def search_players_by_name(name: str = Query(..., min_length=2, description="Player first or last name (minimum 2 characters, case-insensitive)")):
    """
    Search for players by first or last name (case-insensitive, partial matching).
    
    Args:
        name: Player's first or last name (minimum 2 characters)
    
    Returns:
        list: Array of matching players with their team, salary, and contract details
    
    Examples:
        - /players/search?name=Smith → Returns all players with "Smith" in first/last name
        - /players/search?name=mahomes → Returns Patrick Mahomes
        - /players/search?name=travis → Returns Travis Kelce
    """
    search_term = name.lower().strip()
    matches = []
    
    for team_id, players in player_salary_data.items():
        for player_id, player in players.items():
            first_name = player.get("firstName", "").lower()
            last_name = player.get("lastName", "").lower()
            
            # Case-insensitive partial match on first or last name
            if search_term in first_name or search_term in last_name:
                matches.append({
                    "playerId": player_id,
                    "teamId": team_id,
                    "firstName": player.get("firstName"),
                    "lastName": player.get("lastName"),
                    "position": player.get("position"),
                    "salary": player.get("salary"),
                    "status": player.get("status")
                })
    
    if not matches:
        raise HTTPException(
            status_code=404,
            detail=f"No players found matching name: '{name}'"
        )
    
    return {
        "searchTerm": name,
        "resultsFound": len(matches),
        "players": matches
    }


@app.get("/health", tags=["System"])
async def health_check():
    """Health check endpoint."""
    total_players = sum(len(players) for players in player_salary_data.values())
    return {
        "status": "healthy",
        "teams_loaded": len(salary_data),
        "players_loaded": total_players
    }


if __name__ == "__main__":
    # Allow running extraction directly: python main.py
    import sys
    
    if len(sys.argv) > 1:
        if sys.argv[1] == "extract":
            print("Extracting salary information...")
            data = extract_salary_info()
            save_salary_info(data)
            print("Done!")
        elif sys.argv[1] == "extract-players":
            print("Extracting player salary information...")
            data = extract_player_salary_info()
            save_player_salary_info(data)
            print("Done!")
        elif sys.argv[1] == "extract-all":
            print("Extracting all salary information...")
            team_data = extract_salary_info()
            save_salary_info(team_data)
            player_data = extract_player_salary_info()
            save_player_salary_info(player_data)
            print("Done!")
        else:
            print(f"Unknown command: {sys.argv[1]}")
    else:
        print("Available commands:")
        print("  python main.py extract          - Extract team salary info")
        print("  python main.py extract-players  - Extract player salary info")
        print("  python main.py extract-all      - Extract both team and player salary info")
        print("")
        print("To start the API: uvicorn main:app --reload")
