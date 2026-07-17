# Harvest — Lead Acquisition Platform
## Complete Architecture Spec & Implementation Roadmap
### Version 1.0 — Source of Truth Document

> **Purpose of this document:** This is the authoritative spec for the Harvest platform.
> Every AI coding assistant, every new developer, and every future session must be anchored to this document.
> If any generated code contradicts this spec, the spec wins.

---

## Table of Contents

1. [Project Vision](#1-project-vision)
2. [Technology Stack](#2-technology-stack)
3. [Complete Folder Structure](#3-complete-folder-structure)
4. [Data Models](#4-data-models)
5. [Configuration Schemas](#5-configuration-schemas)
6. [Module Responsibilities and Interfaces](#6-module-responsibilities-and-interfaces)
7. [Data Flow](#7-data-flow)
8. [Error Hierarchy](#8-error-hierarchy)
9. [Retry Contracts](#9-retry-contracts)
10. [Database Schema](#10-database-schema)
11. [Logging and Output Schema](#11-logging-and-output-schema)
12. [Anti-Detection Rules](#12-anti-detection-rules)
13. [Phase 1 — Core Working Scraper](#13-phase-1--core-working-scraper)
14. [Phase 2 — Production Hardening](#14-phase-2--production-hardening)
15. [Phase 3 — Multi-Source Platform](#15-phase-3--multi-source-platform)
16. [Phase 4 — AI Planning Layer](#16-phase-4--ai-planning-layer)
17. [Absolute Coding Rules](#17-absolute-coding-rules)
18. [Testing Strategy](#18-testing-strategy)

---

## 1. Project Vision

**Harvest** is a local, CLI-based lead acquisition platform.
It is not a scraper. It is a platform that scrapers plug into.

### Core design philosophy

- The orchestrator never knows which scraper is running.
- The pipeline never knows where data came from.
- The exporter never knows how data was processed.
- The AI planner (future) never controls execution — it only produces a job specification.

### What "local and free" means in practice

- No cloud services. No paid APIs.
- Runs entirely on the user's machine.
- Storage is DuckDB (embedded, no server).
- Browser automation is Playwright (local Chrome/Firefox).
- The only constraint: residential proxy rotation is NOT included but the interface supports it. At scale, free breaks and proxies become necessary. The architecture must accommodate this without code changes.

---

## 2. Technology Stack

All versions are pinned. Do not use unlisted alternatives.

```
Runtime:          Python 3.11+

Browser:          playwright==1.44.0
Anti-detection:   playwright-stealth==1.0.6

Data models:      pydantic==2.7.0
Settings:         pydantic-settings==2.2.1

Data processing:  polars==0.20.18
Storage:          duckdb==0.10.2

Excel export:     openpyxl==3.1.2
Fuzzy matching:   rapidfuzz==3.9.1

CLI:              typer==0.12.3
Terminal UI:      rich==13.7.1

Logging:          loguru==0.7.2
Retry logic:      tenacity==8.3.0

Config:           pyyaml==6.0.1
Env vars:         python-dotenv==1.0.1

HTTP (enricher):  httpx==0.27.0
HTML parsing:     selectolax==0.3.21

Future AI:        litellm==1.40.0   (install in Phase 4 only)
```

**pyproject.toml dependency groups:**

```toml
[project]
name = "harvest"
version = "0.1.0"
requires-python = ">=3.11"

dependencies = [
    "playwright==1.44.0",
    "playwright-stealth==1.0.6",
    "pydantic==2.7.0",
    "pydantic-settings==2.2.1",
    "polars==0.20.18",
    "duckdb==0.10.2",
    "openpyxl==3.1.2",
    "rapidfuzz==3.9.1",
    "typer==0.12.3",
    "rich==13.7.1",
    "loguru==0.7.2",
    "tenacity==8.3.0",
    "pyyaml==6.0.1",
    "python-dotenv==1.0.1",
    "httpx==0.27.0",
    "selectolax==0.3.21",
]

[project.optional-dependencies]
ai = ["litellm==1.40.0"]
dev = ["pytest", "pytest-asyncio", "pytest-mock"]
```

---

## 3. Complete Folder Structure

Every file listed here must exist by the end of Phase 1.
Files marked `# STUB` are empty implementations with docstrings only.

```
harvest/                              ← project root
│
├── main.py                           ← CLI entry point
├── pyproject.toml
├── .env.example
├── .gitignore
├── README.md
│
├── config/
│   ├── settings.yaml                 ← global app config
│   └── scrapers/
│       ├── google_maps.yaml          ← selectors + scraper config
│       ├── justdial.yaml             # STUB (Phase 3)
│       └── indiamart.yaml            # STUB (Phase 3)
│
├── harvest/                          ← main package
│   ├── __init__.py
│   │
│   ├── models/
│   │   ├── __init__.py
│   │   ├── business.py               ← RawBusiness, BusinessLead
│   │   ├── job.py                    ← ScrapeJob, JobStatus
│   │   └── config.py                 ← AppConfig, ScraperConfig
│   │
│   ├── core/
│   │   ├── __init__.py
│   │   ├── orchestrator.py           ← job execution engine
│   │   ├── registry.py               ← plugin auto-discovery
│   │   └── rate_limiter.py           ← token bucket limiter
│   │
│   ├── browser/
│   │   ├── __init__.py
│   │   ├── pool.py                   ← BrowserPool (single instance V1)
│   │   ├── context.py                ← BrowserContext lifecycle
│   │   ├── anti_detection.py         ← HumanBehavior class
│   │   └── session.py                ← cookie/profile persistence
│   │
│   ├── scrapers/
│   │   ├── __init__.py
│   │   ├── base.py                   ← BaseScraper ABC
│   │   ├── google_maps/
│   │   │   ├── __init__.py
│   │   │   ├── scraper.py            ← GoogleMapsScraper
│   │   │   ├── parser.py             ← extract fields from page
│   │   │   ├── navigator.py          ← scroll, click, interact
│   │   │   └── selectors.py          ← load selectors from YAML
│   │   ├── justdial/
│   │   │   ├── __init__.py
│   │   │   └── scraper.py            # STUB
│   │   └── indiamart/
│   │       ├── __init__.py
│   │       └── scraper.py            # STUB
│   │
│   ├── pipeline/
│   │   ├── __init__.py
│   │   ├── validator.py              ← Pydantic validation
│   │   ├── cleaner.py                ← normalize phone, URL, address
│   │   ├── deduplicator.py           ← exact hash + rapidfuzz
│   │   └── enricher.py               ← website scraping, email extract
│   │
│   ├── storage/
│   │   ├── __init__.py
│   │   ├── database.py               ← DuckDB connection manager
│   │   ├── repository.py             ← BusinessRepository
│   │   ├── migrations.py             ← CREATE TABLE statements
│   │   └── cache.py                  ← TTL scrape cache
│   │
│   ├── exporters/
│   │   ├── __init__.py
│   │   ├── base.py                   ← BaseExporter ABC
│   │   ├── excel.py                  ← ExcelExporter
│   │   ├── csv_exporter.py           ← CSVExporter
│   │   └── json_log.py               ← JSONLogExporter
│   │
│   ├── ai/
│   │   ├── __init__.py
│   │   └── planner.py                # STUB (Phase 4)
│   │
│   └── utils/
│       ├── __init__.py
│       ├── logger.py                 ← loguru setup
│       ├── retry.py                  ← tenacity decorators
│       └── timing.py                 ← human-like delays
│
├── scraped_data/                     ← output dir (gitignored)
│   └── .gitkeep
│
├── .harvest/                         ← runtime state (gitignored)
│   └── profiles/                     ← browser profile persistence
│
└── logs/                             ← log files (gitignored)
    └── .gitkeep
```

### .gitignore entries (required)

```
scraped_data/
.harvest/
logs/
.env
__pycache__/
*.pyc
.pytest_cache/
```

---

## 4. Data Models

### 4.1 RawBusiness (`harvest/models/business.py`)

This is the unvalidated output of a scraper. All fields are optional strings.
The scraper produces this. The pipeline validates it into a `BusinessLead`.

```python
from pydantic import BaseModel, ConfigDict
from datetime import datetime

class RawBusiness(BaseModel):
    model_config = ConfigDict(extra="ignore")

    # Required
    name: str
    source: str                    # "google_maps", "justdial", etc.
    source_url: str | None = None
    scraped_at: datetime

    # Optional raw strings (not yet validated/normalized)
    category: str | None = None
    address: str | None = None
    phone: str | None = None       # raw string, e.g. "+91 98765 43210"
    website: str | None = None
    rating: str | None = None      # raw string, e.g. "4.3"
    review_count: str | None = None  # raw string, e.g. "(1,234)"
    hours_raw: str | None = None   # raw multi-line string
    latitude: float | None = None
    longitude: float | None = None

    # Dump of anything else found
    extra_fields: dict = {}
```

### 4.2 BusinessLead (`harvest/models/business.py`)

This is the validated, normalized, deduplicated record. Stored in DuckDB.

```python
import hashlib
from pydantic import BaseModel, ConfigDict, field_validator, computed_field

class BusinessLead(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str                        # UUID4
    job_id: str                    # parent job id

    name: str
    category: str | None = None
    address: str | None = None
    phone: str | None = None       # E.164 format: +91-98765-43210
    website: str | None = None     # normalized URL with scheme
    email: str | None = None       # from enrichment
    rating: float | None = None
    review_count: int | None = None
    hours: dict[str, str] | None = None  # {"Mon": "9am-6pm", "Tue": "Closed"}
    latitude: float | None = None
    longitude: float | None = None

    source: str
    source_url: str | None = None
    scraped_at: datetime
    enriched_at: datetime | None = None

    raw_data: dict = {}            # original RawBusiness fields preserved

    @computed_field
    @property
    def dedup_hash(self) -> str:
        """
        Hash used for deduplication.
        Primary: name + normalized phone (if phone exists)
        Fallback: name + address (first 40 chars)
        """
        name_clean = self.name.lower().strip()
        if self.phone:
            key = f"{name_clean}::{self.phone}"
        elif self.address:
            key = f"{name_clean}::{self.address[:40].lower().strip()}"
        else:
            key = f"{name_clean}::{self.source}"
        return hashlib.sha256(key.encode()).hexdigest()[:16]
```

### 4.3 ScrapeJob (`harvest/models/job.py`)

```python
from enum import Enum
from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
import uuid

class JobStatus(str, Enum):
    PENDING   = "pending"
    RUNNING   = "running"
    COMPLETED = "completed"
    FAILED    = "failed"
    PARTIAL   = "partial"     # ran but some errors occurred

class ScrapeJob(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    query: str
    location: str
    scrapers: list[str] = ["google_maps"]
    max_results: int = 120
    export_formats: list[str] = ["xlsx", "csv"]
    dedup_strategy: str = "fuzzy"   # "exact", "fuzzy", "phone_only"

    status: JobStatus = JobStatus.PENDING
    created_at: datetime = Field(default_factory=datetime.utcnow)
    started_at: datetime | None = None
    completed_at: datetime | None = None

    # Checkpoint: allows resume on failure
    # Example: {"scraper": "google_maps", "subdivision": "Bandra", "records_scraped": 67}
    checkpoint: dict = {}

    records_found: int = 0
    records_exported: int = 0
    errors: list[dict] = []
    metadata: dict = {}

    @property
    def full_query(self) -> str:
        """Returns 'Real Estate Developers Mumbai'"""
        return f"{self.query} {self.location}"

    @property
    def output_slug(self) -> str:
        """Returns 'real_estate_developers_mumbai' (filename safe)"""
        return self.full_query.lower().replace(" ", "_")
```

### 4.4 AppConfig (`harvest/models/config.py`)

```python
from pathlib import Path
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

class AppConfig(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_prefix="HARVEST_",
        case_sensitive=False,
    )

    # Timing — human behavior simulation
    delay_min_seconds: float = 2.0
    delay_max_seconds: float = 5.0
    delay_stddev: float = 0.8
    read_pause_seconds: float = 1.5   # pause when "reading" a listing

    # Browser
    headless: bool = False             # ALWAYS False for Google Maps
    browser_type: str = "chromium"     # "chromium", "firefox"
    viewport_width: int = 1366
    viewport_height: int = 768
    user_data_dir: Path = Path(".harvest/profiles/default")

    # Rate limiting
    requests_per_minute: int = 12      # conservative: 1 per 5 seconds
    burst_limit: int = 3

    # Retry
    max_retries: int = 3
    retry_base_delay: float = 5.0
    retry_max_delay: float = 120.0

    # Storage
    db_path: Path = Path(".harvest/harvest.db")
    cache_ttl_days: int = 30

    # Export
    output_dir: Path = Path("scraped_data")

    # Enrichment
    enrichment_enabled: bool = True
    enrichment_timeout_seconds: float = 10.0

    # Logging
    log_dir: Path = Path("logs")
    log_level: str = "INFO"
    log_json: bool = True              # also write JSON log alongside human log
```

### 4.5 ScraperConfig (`harvest/models/config.py`)

```python
from dataclasses import dataclass

@dataclass
class ScraperConfig:
    """Loaded from config/scrapers/{name}.yaml"""
    name: str
    version: str
    base_url: str
    selectors: dict[str, str]      # field_name -> CSS selector
    scroll: dict                   # scroll behavior config
    geography: dict                # subdivision config
    raw: dict                      # full YAML for anything else
```

---

## 5. Configuration Schemas

### 5.1 `config/settings.yaml`

```yaml
version: "1.0"

timing:
  delay_min_seconds: 2.0
  delay_max_seconds: 5.0
  delay_stddev: 0.8
  read_pause_seconds: 1.5

browser:
  headless: false
  browser_type: "chromium"
  viewport_width: 1366
  viewport_height: 768

rate_limiting:
  requests_per_minute: 12
  burst_limit: 3

retry:
  max_retries: 3
  base_delay: 5.0
  max_delay: 120.0

storage:
  db_path: ".harvest/harvest.db"
  cache_ttl_days: 30

export:
  output_dir: "scraped_data"

enrichment:
  enabled: true
  timeout_seconds: 10.0

logging:
  level: "INFO"
  log_dir: "logs"
  json_enabled: true
```

### 5.2 `config/scrapers/google_maps.yaml`

```yaml
version: "1.2"
scraper: google_maps
base_url: "https://www.google.com/maps/search/"

# ─────────────────────────────────────────────────────────
# CRITICAL: These selectors will break when Google updates.
# Update this file only. NEVER hardcode selectors in Python.
# Run `python main.py --check-selectors` after any Google update.
# ─────────────────────────────────────────────────────────

selectors:
  # Results panel (the sidebar with listings)
  results_panel:       'div[role="feed"]'
  business_card:       'div.Nv2PK'
  card_name:           'div.qBF1Pd'
  card_rating:         'span.MW4etd'
  card_review_count:   'span.UY7F9'
  card_category:       'div.W4Efsd > div.W4Efsd > span:first-child'
  card_address:        'div.W4Efsd > div.W4Efsd > span:last-child'

  # Detail panel (after clicking a listing)
  detail_name:         'h1.DUwDvf'
  detail_category:     'button.DkEaL'
  detail_address:      'button[data-item-id="address"] div.rogA2c'
  detail_phone:        'button[data-item-id^="phone"] div.rogA2c'
  detail_website:      'a[data-item-id="authority"] div.rogA2c'
  detail_hours_button: 'div[data-hide-tooltip-on-mouse-move] button'
  detail_hours_table:  'table.eK4R0e'
  detail_plus_code:    'button[data-item-id="oloc"] div.rogA2c'

  # End-of-results detection
  end_of_results:      'span.HlvSq'

scroll:
  panel_selector:     'div[role="feed"]'
  step_px:             300
  step_variance_px:    80         # randomize scroll step amount
  pause_ms_min:        600
  pause_ms_max:        1400
  max_attempts:        60
  end_text:            "You've reached the end of the list"

geography:
  # City → subdivision mapping for large cities (>120 expected results)
  mumbai:
    - "Bandra Mumbai"
    - "Andheri Mumbai"
    - "Powai Mumbai"
    - "Juhu Mumbai"
    - "Borivali Mumbai"
    - "Thane"
    - "Navi Mumbai"
    - "Malad Mumbai"
    - "Goregaon Mumbai"
    - "Kandivali Mumbai"
    - "Kurla Mumbai"
    - "Ghatkopar Mumbai"
    - "Worli Mumbai"
    - "Lower Parel Mumbai"
    - "BKC Mumbai"
  pune:
    - "Baner Pune"
    - "Hinjewadi Pune"
    - "Koregaon Park Pune"
    - "Hadapsar Pune"
    - "Kharadi Pune"
  delhi:
    - "Connaught Place Delhi"
    - "South Delhi"
    - "Gurgaon"
    - "Noida"

limits:
  max_results_per_query: 120      # Google Maps hard cap
  max_subdivision_results: 120    # same cap applies per subdivision
```

---

## 6. Module Responsibilities and Interfaces

### 6.1 `harvest/utils/logger.py`

**Responsibility:** Configure loguru. Provide a single `logger` object used by all modules.

```python
from loguru import logger as _logger
from pathlib import Path
import sys

def setup_logging(log_dir: Path, level: str, json_enabled: bool) -> None:
    """
    Call once at startup from main.py.
    Sets up:
    - Console sink: human-readable, INFO level
    - File sink: full detail, DEBUG level, rotating at 10MB
    - JSON sink: structured output for scrape_log.json
    """
    ...

# All modules import this
logger = _logger
```

### 6.2 `harvest/utils/timing.py`

**Responsibility:** Provide all human-timing functions. Nothing else.

```python
import asyncio
import random

async def human_delay(
    min_seconds: float = 2.0,
    max_seconds: float = 5.0,
    stddev: float = 0.8
) -> None:
    """
    Gaussian random delay. NEVER use asyncio.sleep(2) directly.
    Always use this function for any pause in scraping.
    """
    mu = (min_seconds + max_seconds) / 2
    delay = max(0.3, random.gauss(mu, stddev))
    await asyncio.sleep(delay)

async def reading_pause() -> None:
    """Simulate pausing to read content. 1-3 seconds."""
    await asyncio.sleep(random.uniform(1.0, 3.0))

async def thinking_pause() -> None:
    """Longer pause simulating decision-making. 3-7 seconds."""
    await asyncio.sleep(random.uniform(3.0, 7.0))
```

### 6.3 `harvest/utils/retry.py`

**Responsibility:** Define and export all retry decorators. Modules import these, not tenacity directly.

```python
from tenacity import (
    retry, stop_after_attempt, wait_exponential_jitter,
    wait_exponential, retry_if_exception_type,
    before_sleep_log, RetryError
)
from harvest.utils.logger import logger

# For transient browser errors (element not found, timeout)
transient_retry = retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential_jitter(initial=2, max=30),
    retry=retry_if_exception_type((TimeoutError,)),
    before_sleep=before_sleep_log(logger, "WARNING"),
    reraise=True,
)

# For rate limit errors
rate_limit_retry = retry(
    stop=stop_after_attempt(5),
    wait=wait_exponential(multiplier=2, min=10, max=120),
    retry=retry_if_exception_type(Exception),  # specify RateLimitError
    before_sleep=before_sleep_log(logger, "WARNING"),
    reraise=True,
)
```

### 6.4 `harvest/browser/anti_detection.py`

**Responsibility:** All human behavior simulation. No scraping logic here.

```python
class HumanBehavior:
    """
    Simulates human interaction patterns.
    Every method is async. Every method accepts a Playwright Page object.
    """

    async def scroll_results_panel(
        self,
        page,
        panel_selector: str,
        step_config: dict,
    ) -> bool:
        """
        Scroll the results panel in human-like increments.
        Returns True when end of results detected, False if max attempts reached.
        Occasionally scrolls BACK slightly (humans do this).
        Randomizes step size within configured variance.
        """
        ...

    async def hover_then_click(self, page, element) -> None:
        """Move mouse to element, pause, then click. Never instant teleport."""
        ...

    async def move_mouse_naturally(self, page, from_x, from_y, to_x, to_y) -> None:
        """Move mouse through 3-5 intermediate points, not straight line."""
        ...

    async def random_viewport_scroll(self, page) -> None:
        """
        Occasionally scroll the main viewport (not just panel).
        Simulates user glancing around.
        """
        ...
```

### 6.5 `harvest/browser/pool.py`

**Responsibility:** Manage browser lifecycle. In Phase 1: single browser instance. In Phase 3+: multiple workers.

```python
class BrowserPool:
    """
    Phase 1: manages a single browser context.
    Phase 3: manages multiple concurrent contexts.
    
    Interface must NOT change between phases.
    """

    def __init__(self, config: AppConfig):
        self._config = config
        self._browser = None
        self._playwright = None

    async def __aenter__(self) -> "BrowserPool":
        """Start playwright and launch browser."""
        ...

    async def __aexit__(self, *args) -> None:
        """Close browser and stop playwright."""
        ...

    async def acquire(self) -> "ManagedContext":
        """
        Get a browser context. Applies stealth, restores session cookies.
        Returns a context manager: async with pool.acquire() as ctx: ...
        """
        ...
```

### 6.6 `harvest/scrapers/base.py`

**Responsibility:** Define the interface all scrapers must implement. No logic.

```python
from abc import ABC, abstractmethod
from typing import AsyncIterator
from harvest.models.business import RawBusiness
from harvest.models.job import ScrapeJob

class BaseScraper(ABC):
    name: str = ""          # class-level, used by registry
    version: str = "1.0"   # class-level

    def __init__(self, config, browser_pool):
        self.config = config
        self.browser_pool = browser_pool

    @abstractmethod
    async def scrape(self, job: ScrapeJob) -> AsyncIterator[RawBusiness]:
        """
        Stream raw business records one at a time.
        NEVER collect all results then yield — always stream.
        NEVER return a list.
        Update job.checkpoint every 10 records.
        """
        ...

    @abstractmethod
    async def validate_selectors(self) -> dict:
        """
        Open the target site and check each selector still works.
        Returns: {"selector_name": "ok" | "warning:reason" | "error:reason"}
        """
        ...

    @property
    @abstractmethod
    def metadata(self) -> dict:
        """
        Returns scraper capabilities. Used by registry and orchestrator.
        Example:
        {
            "name": "google_maps",
            "version": "1.0",
            "requires_login": False,
            "supports_location_filter": True,
            "max_results_per_query": 120,
            "geographic_subdivision_required": True,
        }
        """
        ...
```

### 6.7 `harvest/core/registry.py`

**Responsibility:** Auto-discover and register all scraper plugins.

```python
class ScraperRegistry:
    """
    On startup, scans harvest/scrapers/ for any class inheriting BaseScraper.
    Registers them by their `name` class attribute.
    The orchestrator only interacts with the registry, never imports scrapers directly.
    """

    def __init__(self):
        self._scrapers: dict[str, type] = {}

    def auto_discover(self) -> None:
        """
        Scan scrapers/ directory, import modules, register BaseScraper subclasses.
        Called once at startup.
        """
        ...

    def get(self, name: str, config, browser_pool) -> BaseScraper:
        """Instantiate and return a registered scraper by name."""
        ...

    def list_available(self) -> list[str]:
        """Return names of all registered scrapers."""
        ...
```

### 6.8 `harvest/core/orchestrator.py`

**Responsibility:** Execute a ScrapeJob end to end. Coordinate all layers.

```python
class Orchestrator:
    """
    The orchestrator does NOT know about:
    - Which scraper is running (uses registry)
    - How data is validated (delegates to pipeline)
    - Where data is stored (delegates to repository)
    - How data is exported (delegates to exporters)

    It DOES know about:
    - Job lifecycle (start, checkpoint, complete, fail)
    - Error handling strategy (which errors stop the job vs. continue)
    - Output path construction
    """

    async def execute(self, job: ScrapeJob) -> ScrapeJob:
        """
        Main execution flow:

        1. Persist job to DuckDB with status=RUNNING
        2. Validate selectors for all scrapers in job
        3. For each scraper:
           a. If scraper requires geographic subdivision and location
              is in the large-city list, expand to subdivisions
           b. For each query (or subdivision):
              - Scrape → stream RawBusiness records
              - For each record: run pipeline (validate → clean → dedup → enrich)
              - Save to BusinessRepository
              - Update checkpoint every 10 records
        4. After all scrapers: run exporters
        5. Update job status to COMPLETED or PARTIAL
        6. Write scrape_log.json
        7. Return final job
        """
        ...
```

### 6.9 `harvest/pipeline/cleaner.py`

**Responsibility:** Normalize all field values. No business logic here — only formatting.

```python
class DataCleaner:
    """
    All methods are pure functions (no state, no I/O).
    Input: raw string.
    Output: normalized string or None.
    NEVER raises exceptions — logs warning and returns None on failure.
    """

    def normalize_phone(self, raw: str | None) -> str | None:
        """
        Rules:
        - Strip all non-digit characters
        - If 10 digits and starts with [6-9]: add +91 prefix
        - If starts with 0: drop leading 0, add +91
        - If already has +91: keep as-is
        - Format: +91-XXXXX-XXXXX
        - Returns None if not a valid Indian mobile/landline
        """
        ...

    def normalize_url(self, raw: str | None) -> str | None:
        """
        Rules:
        - Add https:// if no scheme
        - Lowercase scheme and domain
        - Strip tracking parameters (utm_*, fbclid, gclid)
        - Strip trailing slashes
        - Returns None if unparseable
        """
        ...

    def normalize_address(self, raw: str | None) -> str | None:
        """
        Rules:
        - Strip extra whitespace
        - Expand common abbreviations (Rd → Road, St → Street)
        - Normalize comma spacing
        """
        ...

    def normalize_rating(self, raw: str | None) -> float | None:
        """Extract float from strings like '4.3' or '4.3 stars'"""
        ...

    def normalize_review_count(self, raw: str | None) -> int | None:
        """Extract int from strings like '(1,234)' or '1234 reviews'"""
        ...

    def parse_hours(self, raw: str | None) -> dict[str, str] | None:
        """
        Parse hours string into dict.
        Input: "Mon–Fri 9am–6pm, Sat 10am–4pm, Sun Closed"
        Output: {"Mon": "9am-6pm", "Tue": "9am-6pm", ..., "Sun": "Closed"}
        """
        ...
```

### 6.10 `harvest/pipeline/deduplicator.py`

**Responsibility:** Detect and filter duplicate records.

```python
class Deduplicator:
    """
    Two-stage deduplication:
    Stage 1 — Exact hash match against DuckDB (fast, no false positives)
    Stage 2 — Fuzzy name + address match against recent records (catches variations)

    dedup_strategy options:
    - "exact"       : Stage 1 only
    - "fuzzy"       : Stage 1 + Stage 2 (default)
    - "phone_only"  : Deduplicate on phone number only
    """

    def __init__(self, repository, strategy: str = "fuzzy"):
        ...

    async def is_duplicate(self, lead: BusinessLead) -> bool:
        """Returns True if this lead already exists in the database."""
        ...

    async def find_similar(self, lead: BusinessLead, threshold: int = 85) -> list:
        """
        Fuzzy match against records from same source.
        Uses rapidfuzz.fuzz.token_sort_ratio on (name + address).
        Returns list of similar existing records above threshold.
        """
        ...
```

### 6.11 `harvest/storage/repository.py`

**Responsibility:** All database interactions for BusinessLead records.

```python
class BusinessRepository:
    """
    The only class allowed to read/write leads to DuckDB.
    No other module writes leads directly.
    """

    def __init__(self, db: DuckDBConnection):
        ...

    async def save(self, lead: BusinessLead) -> BusinessLead:
        """Insert lead. Returns saved lead."""
        ...

    async def get_by_job(self, job_id: str) -> list[BusinessLead]:
        """Return all leads for a job. Used by exporters."""
        ...

    async def exists_by_hash(self, dedup_hash: str) -> bool:
        """Fast exact dedup check."""
        ...

    async def search(
        self,
        name: str | None = None,
        location: str | None = None,
        source: str | None = None,
        min_rating: float | None = None,
        scraped_after: datetime | None = None,
    ) -> list[BusinessLead]:
        """Ad-hoc query. Used by future CLI query commands."""
        ...

    async def update(self, lead_id: str, updates: dict) -> BusinessLead:
        """Partial update. Used by enricher."""
        ...
```

### 6.12 `harvest/exporters/base.py`

**Responsibility:** Define the exporter interface.

```python
from abc import ABC, abstractmethod
from pathlib import Path

class BaseExporter(ABC):
    name: str = ""

    @abstractmethod
    async def export(
        self,
        leads: list[BusinessLead],
        job: ScrapeJob,
        output_dir: Path,
    ) -> Path:
        """
        Write leads to file.
        Returns path of written file.
        Output filename format: {output_dir}/{YYYY-MM-DD}/{job.output_slug}.{ext}
        """
        ...
```

---

## 7. Data Flow

This is the exact sequence of types and transformations through the system.

```
User input: "Real Estate Developers Mumbai"
    │
    ▼
main.py → CLI parses input → constructs ScrapeJob
    │
    │   ScrapeJob {
    │     query: "Real Estate Developers",
    │     location: "Mumbai",
    │     scrapers: ["google_maps"]
    │   }
    │
    ▼
Orchestrator.execute(job: ScrapeJob)
    │
    ├── Job saved to DuckDB (status=RUNNING)
    │
    ├── Orchestrator detects "Mumbai" is a large city
    │   → expands to 15 sub-queries from google_maps.yaml
    │
    └── For each sub-query (e.g. "Real Estate Developers Bandra Mumbai"):
            │
            ▼
        GoogleMapsScraper.scrape(job) → AsyncIterator[RawBusiness]
            │
            │   RawBusiness {
            │     name: "Oberoi Realty",
            │     source: "google_maps",
            │     phone: "+91 22 6677 3333",  ← raw string
            │     rating: "4.1",              ← raw string
            │   }
            │
            ▼
        pipeline.Validator.validate(raw) → BusinessLead | raises ValidationError
            │
            ▼
        pipeline.Cleaner.clean(lead) → BusinessLead
            │   phone normalized: "+91-22667-73333"
            │   website normalized: "https://oberoirealty.com"
            │
            ▼
        pipeline.Deduplicator.is_duplicate(lead) → bool
            │   if True → log warning, skip
            │   if False → continue
            │
            ▼
        pipeline.Enricher.enrich(lead) → BusinessLead   [async, optional]
            │   visits website, extracts email
            │
            ▼
        BusinessRepository.save(lead) → saved to DuckDB
            │
            ▼
        Orchestrator updates job.checkpoint every 10 records
            │
            (all subdivisions complete)
            │
            ▼
        BusinessRepository.get_by_job(job.id) → list[BusinessLead]
            │
            ▼
        ExcelExporter.export(leads, job, output_dir) → Path
        CSVExporter.export(leads, job, output_dir) → Path
        JSONLogExporter.export(job) → Path
            │
            ▼
        Job status → COMPLETED
        Rich summary table printed to terminal
```

---

## 8. Error Hierarchy

All errors must be importable from `harvest.core.exceptions`.

```python
# harvest/core/exceptions.py

class HarvestError(Exception):
    """Base exception for all Harvest errors."""
    pass


# ── Scraper errors ────────────────────────────────────────────────────

class ScraperError(HarvestError):
    """Base for all scraper errors."""
    pass

class SelectorNotFoundError(ScraperError):
    """
    A CSS selector did not match on the page.
    SEVERITY: WARNING — log field as missing, continue to next record.
    DO NOT stop the job.
    """
    pass

class RateLimitError(ScraperError):
    """
    Google is rate limiting this IP.
    SEVERITY: WARNING — retry with exponential backoff.
    After 5 failed retries: save checkpoint, stop job, status=PARTIAL.
    """
    pass

class CaptchaDetectedError(ScraperError):
    """
    A CAPTCHA has appeared.
    SEVERITY: WARNING — save checkpoint, pause job, notify user via Rich.
    Do NOT attempt automated CAPTCHA solving.
    """
    pass

class BrowserCrashError(ScraperError):
    """
    The browser process died unexpectedly.
    SEVERITY: ERROR — restart browser, resume from checkpoint.
    After 2 crashes in one job: stop job, status=PARTIAL.
    """
    pass

class EndOfResultsReached(ScraperError):
    """
    Not an error — signals that all results have been scrolled through.
    Used as a control flow signal, not a failure.
    """
    pass


# ── Pipeline errors ───────────────────────────────────────────────────

class PipelineError(HarvestError):
    pass

class ValidationError(PipelineError):
    """
    Record failed Pydantic validation (e.g. name is empty).
    SEVERITY: WARNING — skip record, log it.
    """
    pass

class NormalizationError(PipelineError):
    """
    Cleaner could not parse a field.
    SEVERITY: WARNING — use raw value, log it.
    NEVER raise this — cleaner always returns None on failure.
    """
    pass


# ── Storage errors ────────────────────────────────────────────────────

class StorageError(HarvestError):
    """
    DuckDB write failed.
    SEVERITY: CRITICAL — stop job immediately. Database integrity must be preserved.
    """
    pass


# ── Export errors ─────────────────────────────────────────────────────

class ExportError(HarvestError):
    """
    Exporter failed to write file.
    SEVERITY: ERROR — retry once. If still fails, log and continue.
    Failure to export does NOT invalidate the data in DuckDB.
    """
    pass
```

---

## 9. Retry Contracts

### 9.1 When to retry

| Error Type                | Retry? | Strategy                              |
|---------------------------|--------|---------------------------------------|
| `TimeoutError`            | Yes    | 3 attempts, exponential jitter        |
| `SelectorNotFoundError`   | Yes    | 2 attempts, 2s flat delay             |
| `RateLimitError`          | Yes    | 5 attempts, exponential 10s→120s      |
| `CaptchaDetectedError`    | No     | Stop, checkpoint, notify user         |
| `BrowserCrashError`       | Yes    | 2 attempts, restart browser           |
| `StorageError`            | No     | Stop job immediately                  |
| `ExportError`             | Yes    | 1 attempt, then log and continue      |
| `ValidationError`         | No     | Skip record, continue                 |

### 9.2 Retry decorator usage

```python
# In scraper navigator methods (transient browser errors):
@transient_retry
async def click_listing(self, page, element) -> None: ...

# In methods that hit Google servers (rate limit risk):
@rate_limit_retry
async def load_listing_detail(self, page, url: str) -> None: ...

# NEVER put retry on the main scrape() generator method.
# Retry individual sub-operations, not the whole scrape.
```

---

## 10. Database Schema

File: `harvest/storage/migrations.py`
Called once at startup via `database.py`.

```sql
-- ── Jobs ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS jobs (
    id              VARCHAR PRIMARY KEY,
    query           VARCHAR NOT NULL,
    location        VARCHAR,
    scrapers        VARCHAR[],
    max_results     INTEGER DEFAULT 120,
    export_formats  VARCHAR[],
    dedup_strategy  VARCHAR DEFAULT 'fuzzy',
    status          VARCHAR NOT NULL DEFAULT 'pending',
    created_at      TIMESTAMP NOT NULL,
    started_at      TIMESTAMP,
    completed_at    TIMESTAMP,
    checkpoint      JSON DEFAULT '{}',
    records_found   INTEGER DEFAULT 0,
    records_exported INTEGER DEFAULT 0,
    errors          JSON DEFAULT '[]',
    metadata        JSON DEFAULT '{}'
);


-- ── Business leads ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS leads (
    id              VARCHAR PRIMARY KEY,
    job_id          VARCHAR NOT NULL REFERENCES jobs(id),
    name            VARCHAR NOT NULL,
    category        VARCHAR,
    address         VARCHAR,
    phone           VARCHAR,
    website         VARCHAR,
    email           VARCHAR,
    rating          FLOAT,
    review_count    INTEGER,
    hours           JSON,
    latitude        FLOAT,
    longitude       FLOAT,
    source          VARCHAR NOT NULL,
    source_url      VARCHAR,
    scraped_at      TIMESTAMP NOT NULL,
    enriched_at     TIMESTAMP,
    dedup_hash      VARCHAR NOT NULL,
    raw_data        JSON DEFAULT '{}'
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_leads_job_id     ON leads(job_id);
CREATE INDEX IF NOT EXISTS idx_leads_dedup_hash ON leads(dedup_hash);
CREATE INDEX IF NOT EXISTS idx_leads_source     ON leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_scraped_at ON leads(scraped_at);
CREATE INDEX IF NOT EXISTS idx_leads_phone      ON leads(phone);


-- ── Scrape cache ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS scrape_cache (
    url_hash    VARCHAR PRIMARY KEY,
    url         VARCHAR NOT NULL,
    cached_at   TIMESTAMP NOT NULL,
    expires_at  TIMESTAMP NOT NULL,
    lead_id     VARCHAR REFERENCES leads(id)
);

CREATE INDEX IF NOT EXISTS idx_cache_expires ON scrape_cache(expires_at);
```

---

## 11. Logging and Output Schema

### 11.1 Output directory structure

```
scraped_data/
└── 2025-01-15/
    ├── real_estate_developers_mumbai.xlsx
    ├── real_estate_developers_mumbai.csv
    └── real_estate_developers_mumbai_log.json
```

### 11.2 `scrape_log.json` schema

```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "query": "Real Estate Developers",
  "location": "Mumbai",
  "full_query": "Real Estate Developers Mumbai",
  "scrapers": ["google_maps"],
  "status": "completed",

  "timing": {
    "started_at": "2025-01-15T10:30:00Z",
    "completed_at": "2025-01-15T10:47:23Z",
    "duration_seconds": 1043
  },

  "results": {
    "total_raw_scraped": 312,
    "after_validation": 308,
    "after_dedup_exact": 298,
    "after_dedup_fuzzy": 281,
    "enriched": 203,
    "exported": 281
  },

  "geographic_splits": [
    {"subdivision": "Bandra Mumbai", "raw_count": 28, "final_count": 24},
    {"subdivision": "Andheri Mumbai", "raw_count": 34, "final_count": 31}
  ],

  "field_extraction_rates": {
    "name":         {"extracted": 312, "failed": 0,  "rate": "100%"},
    "phone":        {"extracted": 276, "failed": 36, "rate": "88%"},
    "website":      {"extracted": 201, "failed": 111,"rate": "64%"},
    "address":      {"extracted": 305, "failed": 7,  "rate": "98%"},
    "rating":       {"extracted": 309, "failed": 3,  "rate": "99%"},
    "hours":        {"extracted": 188, "failed": 124,"rate": "60%"},
    "latitude":     {"extracted": 312, "failed": 0,  "rate": "100%"}
  },

  "selector_health": {
    "results_panel":   "ok",
    "business_card":   "ok",
    "detail_phone":    "warning: miss_rate=0.12",
    "detail_hours":    "ok"
  },

  "errors": [
    {
      "type": "SelectorNotFoundError",
      "field": "detail_phone",
      "count": 36,
      "severity": "warning"
    }
  ],

  "exports": [
    {
      "format": "xlsx",
      "path": "scraped_data/2025-01-15/real_estate_developers_mumbai.xlsx",
      "rows": 281
    },
    {
      "format": "csv",
      "path": "scraped_data/2025-01-15/real_estate_developers_mumbai.csv",
      "rows": 281
    }
  ]
}
```

### 11.3 Loguru configuration

```python
# harvest/utils/logger.py

def setup_logging(config: AppConfig) -> None:
    logger.remove()  # Remove default handler

    # Human-readable console output
    logger.add(
        sys.stderr,
        level=config.log_level,
        format="<green>{time:HH:mm:ss}</green> | <level>{level: <8}</level> | {message}",
        colorize=True,
    )

    # Full debug file log (rotating)
    logger.add(
        config.log_dir / "harvest_{time:YYYY-MM-DD}.log",
        level="DEBUG",
        rotation="10 MB",
        retention="14 days",
        format="{time:YYYY-MM-DD HH:mm:ss} | {level} | {name}:{line} | {message}",
    )

    # Structured JSON log (for machine reading)
    if config.log_json:
        logger.add(
            config.log_dir / "harvest_{time:YYYY-MM-DD}.json",
            level="INFO",
            rotation="10 MB",
            serialize=True,  # writes JSON
        )
```

---

## 12. Anti-Detection Rules

These rules are non-negotiable. Any deviation will result in IP bans.

### Rule 1: Never use asyncio.sleep() directly

```python
# WRONG
await asyncio.sleep(2)

# CORRECT
await human_delay(min_seconds=1.5, max_seconds=4.0)
```

### Rule 2: Always use headed browser for Google Maps

```python
# config/settings.yaml
browser:
  headless: false   # DO NOT change this to true for Google Maps
```

### Rule 3: Never scroll at a uniform speed

The scroll panel must use randomized step sizes and random pauses between scrolls.
See `HumanBehavior.scroll_results_panel()`.

### Rule 4: Rotate user agents per session

A fresh random user agent from the following list (Chrome on Windows/Mac/Linux only):

```python
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
]
```

### Rule 5: Persist browser profiles

Store cookies and localStorage to `.harvest/profiles/default`.
A browser that has visited Google Maps before looks far less suspicious than a fresh session.

### Rule 6: Never visit more than 1 listing per 5 seconds on average

The rate limiter in `core/rate_limiter.py` enforces this.
`config.requests_per_minute = 12` means 1 request per 5 seconds.

### Rule 7: Apply playwright-stealth immediately after browser launch

```python
from playwright_stealth import stealth_async

async with browser_pool.acquire() as ctx:
    page = await ctx.new_page()
    await stealth_async(page)   # ALWAYS first, before any navigation
```

### Rule 8: CAPTCHA detection means stop, not retry

```python
# In navigator.py — check for CAPTCHA after every page load
async def check_for_captcha(self, page) -> bool:
    captcha_indicators = [
        'iframe[src*="recaptcha"]',
        'div#captcha',
        'form[action*="sorry"]',   # Google's unusual traffic page
    ]
    for selector in captcha_indicators:
        if await page.query_selector(selector):
            return True
    return False
```

---

## 13. Phase 1 — Core Working Scraper

**Goal:** A working end-to-end scrape of Google Maps that produces an Excel file.
**Duration:** 3 weeks
**Success criterion:** Running `python main.py` and getting a real `.xlsx` file with 50+ listings.

---

### Week 1 — Foundation

**Day 1-2: Project skeleton**

- [ ] Create all directories from Section 3
- [ ] Create all `__init__.py` files (empty with docstrings)
- [ ] Create `pyproject.toml` with all dependencies
- [ ] Install: `pip install -e ".[dev]"` then `playwright install chromium`
- [ ] Create `.env.example` with all `HARVEST_*` variables
- [ ] Create `config/settings.yaml` from Section 5.1
- [ ] Create `config/scrapers/google_maps.yaml` from Section 5.2
- [ ] Verify: `python -c "import harvest"` succeeds

**Day 3: Data models**

- [ ] Implement `harvest/models/business.py` — `RawBusiness` and `BusinessLead`
- [ ] Implement `harvest/models/job.py` — `ScrapeJob` and `JobStatus`
- [ ] Implement `harvest/models/config.py` — `AppConfig` and `ScraperConfig`
- [ ] Write test: instantiate all models, verify `dedup_hash` computes correctly
- [ ] Verify: `python -c "from harvest.models.job import ScrapeJob; print(ScrapeJob(query='test', location='Mumbai'))"` prints correctly

**Day 4: Utilities**

- [ ] Implement `harvest/utils/logger.py` — setup_logging, export `logger`
- [ ] Implement `harvest/utils/timing.py` — `human_delay`, `reading_pause`, `thinking_pause`
- [ ] Implement `harvest/utils/retry.py` — `transient_retry`, `rate_limit_retry`
- [ ] Create `harvest/core/exceptions.py` — full error hierarchy from Section 8
- [ ] Write test: retry decorator retries on TimeoutError, stops on StorageError

**Day 5: Database**

- [ ] Implement `harvest/storage/migrations.py` — full schema from Section 10
- [ ] Implement `harvest/storage/database.py` — DuckDB connection manager, run migrations on connect
- [ ] Implement `harvest/storage/repository.py` — `save`, `get_by_job`, `exists_by_hash`
- [ ] Write test: save a BusinessLead, retrieve by job_id, verify dedup_hash lookup

---

### Week 2 — Browser and Scraper

**Day 6-7: Browser layer**

- [ ] Implement `harvest/browser/session.py` — profile directory management
- [ ] Implement `harvest/browser/anti_detection.py` — `HumanBehavior` class (all methods)
- [ ] Implement `harvest/browser/context.py` — context creation, stealth application
- [ ] Implement `harvest/browser/pool.py` — `BrowserPool` as async context manager
- [ ] Manual test: open Google Maps and browse manually in the managed browser

**Day 8-9: Google Maps scraper**

- [ ] Implement `harvest/scrapers/base.py` — `BaseScraper` ABC
- [ ] Implement `harvest/scrapers/google_maps/selectors.py` — load from YAML
- [ ] Implement `harvest/scrapers/google_maps/navigator.py`:
  - `search(query)` — type into search bar and submit
  - `scroll_results(panel_selector)` — scroll with `HumanBehavior`
  - `get_all_listing_cards()` — return list of card elements
  - `click_listing(card)` — click and wait for detail panel
  - `close_listing()` — click back/close
- [ ] Implement `harvest/scrapers/google_maps/parser.py`:
  - `parse_card(card_element)` — extract name, rating, review_count, category, address from card
  - `parse_detail(page)` — extract name, phone, website, address, hours, coordinates from detail panel
  - `extract_coordinates(page)` — parse lat/lng from URL hash
- [ ] Implement `harvest/scrapers/google_maps/scraper.py`:
  - `scrape(job)` → `AsyncIterator[RawBusiness]`
  - `validate_selectors()` → selector health dict
  - `metadata` property

**Day 10: Integration test**

- [ ] Write a standalone test that runs `GoogleMapsScraper` and prints first 5 results
- [ ] Fix any selector issues manually (update `google_maps.yaml`)
- [ ] Verify coordinates are extracted
- [ ] Verify `AsyncIterator` streaming works (records come in one at a time)

---

### Week 3 — Pipeline, Storage, Export, CLI

**Day 11: Data pipeline**

- [ ] Implement `harvest/pipeline/validator.py` — Pydantic validation from `RawBusiness`
- [ ] Implement `harvest/pipeline/cleaner.py` — all normalize methods from Section 6.9
- [ ] Implement `harvest/pipeline/deduplicator.py` — exact hash check (fuzzy in Phase 2)
- [ ] Write tests for each cleaner method with edge cases (None inputs, malformed strings)

**Day 12: Storage cache + enricher stub**

- [ ] Implement `harvest/storage/cache.py` — TTL-based URL cache
- [ ] Create `harvest/pipeline/enricher.py` as a stub that returns the lead unchanged
  - (Full enricher in Phase 2)

**Day 13: Exporters**

- [ ] Implement `harvest/exporters/base.py` — `BaseExporter` ABC
- [ ] Implement `harvest/exporters/excel.py` — openpyxl, auto-sized columns, header row styled
- [ ] Implement `harvest/exporters/csv_exporter.py` — polars to_csv
- [ ] Implement `harvest/exporters/json_log.py` — write `scrape_log.json` from Section 11.2

**Day 14: Orchestrator + Registry**

- [ ] Implement `harvest/core/registry.py` — auto-discovery of BaseScraper subclasses
- [ ] Implement `harvest/core/orchestrator.py` — full execution flow from Section 6.8

**Day 15: CLI**

- [ ] Implement `main.py`:

```python
import typer
from rich.console import Console
from rich.prompt import Prompt
from harvest.models.job import ScrapeJob
from harvest.core.orchestrator import Orchestrator
from harvest.models.config import AppConfig
from harvest.storage.database import Database
from harvest.utils.logger import setup_logging
import asyncio

app = typer.Typer()
console = Console()

@app.command()
def scrape(
    query: str = typer.Option(None, help="What to scrape"),
    location: str = typer.Option(None, help="Location"),
    check_selectors: bool = typer.Option(False, "--check-selectors"),
):
    """Harvest — lead acquisition platform"""
    config = AppConfig()
    setup_logging(config)

    if not query:
        query = Prompt.ask("[bold green]What do you want to scrape?[/]")
    if not location:
        location = Prompt.ask("[bold green]Location?[/]")

    job = ScrapeJob(query=query, location=location)

    asyncio.run(_run_job(job, config))

async def _run_job(job: ScrapeJob, config: AppConfig):
    async with Database(config) as db:
        orchestrator = Orchestrator(config=config, db=db)
        await orchestrator.execute(job)

if __name__ == "__main__":
    app()
```

- [ ] End-to-end test: `python main.py` → type a query → get `.xlsx` file

---

## 14. Phase 2 — Production Hardening

**Goal:** Reliable enough for daily production use by a professional agency.
**Duration:** 2 weeks

### Week 4 — Reliability

**Geographic subdivision**
- [ ] Implement subdivision detection in `Orchestrator`: if `location` key is in `google_maps.yaml` geography dict, expand to sub-queries
- [ ] Merge and deduplicate results across subdivisions
- [ ] Progress display: "Bandra Mumbai — 28 results | Andheri Mumbai — 31 results..."

**Checkpoint and resume**
- [ ] Every 10 records: update `job.checkpoint` in DuckDB
- [ ] Add CLI flag: `python main.py --resume JOB_ID`
- [ ] On resume: load job from DuckDB, skip subdivisions already completed

**Selector health monitoring**
- [ ] Implement `validate_selectors()` properly in `GoogleMapsScraper`
- [ ] Run selector check before every job
- [ ] Warn (but don't stop) if any selector miss rate exceeds 15%
- [ ] Add standalone command: `python main.py --check-selectors`

**CAPTCHA handling**
- [ ] Implement `check_for_captcha()` in `navigator.py`
- [ ] On detection: save checkpoint, display Rich warning, pause and wait for user input to continue
- [ ] Add option: `--captcha-pause-minutes N`

**Rate limiter**
- [ ] Implement token bucket in `harvest/core/rate_limiter.py`
- [ ] Enforce `requests_per_minute` across all browser requests

### Week 5 — Enrichment and Polish

**Enrichment pipeline**
- [ ] Implement `harvest/pipeline/enricher.py`:
  - Visit `lead.website` with `httpx` (not browser — faster, less detectable)
  - Parse HTML with `selectolax` for `mailto:` links and contact patterns
  - Extract social links (LinkedIn page, Facebook, Instagram)
  - Update `lead.email`, `lead.enriched_at`
  - Respect `enrichment_timeout_seconds` config
  - Skip enrichment if `lead.website` is None
- [ ] Add `--skip-enrichment` CLI flag

**Fuzzy deduplication**
- [ ] Implement Stage 2 in `Deduplicator.find_similar()` using `rapidfuzz`
- [ ] Threshold: 85 (configurable in settings.yaml)
- [ ] Log all fuzzy duplicates to scrape_log.json for review

**Caching**
- [ ] Implement `harvest/storage/cache.py`:
  - Before scraping any URL: check `scrape_cache` table, skip if `expires_at` > now
  - After scraping: insert into cache with `expires_at = now + cache_ttl_days`

**CLI UX polish**
- [ ] Rich progress bar with: `[scraper] [subdivision] | scraped: N | unique: N | ETA: Xs`
- [ ] Summary table at end: columns, unique count, duplicates removed, export paths
- [ ] Add `python main.py --list-jobs` to show recent job history from DuckDB
- [ ] Add `python main.py --export JOB_ID --format xlsx` to re-export without re-scraping

---

## 15. Phase 3 — Multi-Source Platform

**Goal:** JustDial and IndiaMART scrapers. Plugin registry working in practice.
**Duration:** 5 weeks

### Week 6-7: JustDial scraper

- [ ] Create `config/scrapers/justdial.yaml` with selectors
- [ ] Implement `harvest/scrapers/justdial/scraper.py`
- [ ] JustDial uses pagination (not infinite scroll) — implement page-by-page navigation
- [ ] Cross-source deduplication: same business in Google Maps and JustDial → keep one, flag source
- [ ] Test combined scrape: same query across both sources

### Week 8-9: IndiaMART scraper

- [ ] Create `config/scrapers/indiamart.yaml` with selectors
- [ ] Implement `harvest/scrapers/indiamart/scraper.py`
- [ ] IndiaMART uses login for some data — implement optional login flow

### Week 10: Plugin system hardening

- [ ] Finalize `ScraperRegistry.auto_discover()` — scan directory, no manual registration
- [ ] Add scraper metadata to Excel output: "Source" column per row
- [ ] Combined export: single Excel with all sources, separate sheets per source
- [ ] CLI multi-source: `python main.py --scrapers google_maps,justdial`

---

## 16. Phase 4 — AI Planning Layer

**Goal:** Natural language → `ScrapeJob` via local or cloud LLM.
**Duration:** 1 week (after Phase 3 complete)

### Implementation

- [ ] Install: `pip install ".[ai]"` (adds litellm)
- [ ] Implement `harvest/ai/planner.py`:

```python
class AIPlanner:
    """
    Takes natural language user input.
    Returns a validated ScrapeJob.
    NEVER controls execution — only produces specifications.
    """

    SYSTEM_PROMPT = """
    You are a lead generation planning assistant.
    Your job is to convert a natural language scraping request into a structured JSON job specification.
    You must respond with ONLY valid JSON that matches the ScrapeJob schema.
    Do not explain yourself. Do not add commentary. JSON only.

    ScrapeJob schema:
    {
        "query": "string — the search term (without location)",
        "location": "string — the city or area",
        "scrapers": ["array of scraper names: google_maps, justdial, indiamart"],
        "max_results": "integer — 120 maximum per source",
        "export_formats": ["xlsx", "csv"],
        "dedup_strategy": "fuzzy"
    }

    Examples:
    Input: "Find luxury villa developers in Pune"
    Output: {"query": "Luxury Villa Developers", "location": "Pune", "scrapers": ["google_maps", "justdial"], "max_results": 120, "export_formats": ["xlsx", "csv"], "dedup_strategy": "fuzzy"}
    """

    async def plan(self, user_input: str) -> ScrapeJob:
        """
        Call LLM with user_input.
        Parse JSON response.
        Validate as ScrapeJob.
        Return ScrapeJob or raise if unparseable.
        """
        ...
```

- [ ] Add `--ai` flag to CLI: `python main.py --ai "Find co-working spaces in Hyderabad"`
- [ ] Add config for LLM: `HARVEST_LLM_PROVIDER=ollama`, `HARVEST_LLM_MODEL=llama3`
- [ ] Test with Ollama local model (free) and Claude API (fallback)

---

## 17. Absolute Coding Rules

These rules are non-negotiable. Any AI assistant generating code for this project must follow them.
If generated code violates any of these rules, reject it and regenerate.

### Rule 1: All scraping code is async

Every scraper method, every browser interaction, every pipeline step that touches the browser or network must be `async def`. No synchronous Playwright calls.

### Rule 2: Scrapers return AsyncIterator, never a list

```python
# WRONG
async def scrape(self, job) -> list[RawBusiness]:
    results = []
    # ... collect all ...
    return results

# CORRECT
async def scrape(self, job) -> AsyncIterator[RawBusiness]:
    async for card in self._get_cards():
        yield RawBusiness(...)
```

### Rule 3: Selectors live only in YAML

```python
# WRONG
element = await page.locator(".hfpxzc").first

# CORRECT
selector = self.selectors["business_card"]
element = await page.locator(selector).first
```

### Rule 4: No module imports from the same or higher layer

```
CLI      → can import from: core, models, utils
Core     → can import from: models, utils, storage
Scrapers → can import from: models, browser, utils, core.exceptions
Pipeline → can import from: models, storage, utils
Storage  → can import from: models, utils
Exporters → can import from: models, utils

NEVER: scraper imports from pipeline
NEVER: pipeline imports from core.orchestrator
NEVER: storage imports from scrapers
```

### Rule 5: Never write leads directly to files

All lead persistence goes through `BusinessRepository.save()`.
Exporters read from `BusinessRepository.get_by_job()`.
Nothing bypasses the repository.

### Rule 6: Checkpoint updates every 10 records

```python
# In orchestrator.py inner loop
if records_processed % 10 == 0:
    job.checkpoint["records_scraped"] = records_processed
    job.checkpoint["last_subdivision"] = current_subdivision
    await self.job_repo.update_checkpoint(job)
```

### Rule 7: All Pydantic models use ConfigDict(extra='ignore')

```python
class BusinessLead(BaseModel):
    model_config = ConfigDict(extra="ignore")
```

This ensures models don't break when Google adds new fields.

### Rule 8: Logger imported from harvest.utils.logger only

```python
# CORRECT
from harvest.utils.logger import logger

# WRONG
import logging
logging.getLogger(__name__)
```

### Rule 9: human_delay() replaces all asyncio.sleep() calls

```python
# WRONG — anywhere in scraping code
await asyncio.sleep(2)

# CORRECT
from harvest.utils.timing import human_delay
await human_delay(min_seconds=1.5, max_seconds=3.5)
```

### Rule 10: Partial failure is not total failure

The orchestrator must NEVER let a single record failure abort the job.
Wrap every record processing in try/except.
Log failures. Continue.

```python
async for raw_business in scraper.scrape(job):
    try:
        lead = await pipeline.process(raw_business)
        if lead:
            await repository.save(lead)
            job.records_found += 1
    except ValidationError as e:
        logger.warning(f"Skipping record: {e}")
        job.errors.append({"type": "ValidationError", "detail": str(e)})
    except StorageError:
        raise  # This one IS fatal
```

---

## 18. Testing Strategy

### Test structure

```
tests/
├── unit/
│   ├── test_models.py           # all Pydantic models
│   ├── test_cleaner.py          # all normalize methods
│   ├── test_deduplicator.py     # exact and fuzzy logic
│   └── test_registry.py        # plugin discovery
├── integration/
│   ├── test_database.py        # DuckDB operations
│   ├── test_repository.py      # save, query, update
│   └── test_exporters.py       # Excel, CSV output
└── e2e/
    └── test_google_maps.py     # real browser (marked slow)
```

### pytest configuration

```toml
# pyproject.toml
[tool.pytest.ini_options]
asyncio_mode = "auto"
markers = [
    "slow: requires real browser and network",
    "unit: fast, no I/O",
    "integration: requires DuckDB",
]
```

### Minimum test coverage required before moving to next phase

| Phase | Minimum coverage |
|-------|------------------|
| Phase 1 complete | All models, all cleaner methods, database operations |
| Phase 2 complete | Deduplicator, enricher, checkpoint/resume |
| Phase 3 complete | All scrapers validate_selectors(), registry discovery |
| Phase 4 complete | AI planner JSON parsing, malformed LLM response handling |

---

## Quick Reference

### Commands

```bash
# Install
pip install -e ".[dev]"
playwright install chromium

# Run (interactive)
python main.py

# Run (direct)
python main.py --query "Real Estate Developers" --location "Mumbai"

# Check selectors before scraping
python main.py --check-selectors

# Resume failed job
python main.py --resume JOB_ID

# Re-export without re-scraping
python main.py --export JOB_ID --format xlsx

# List recent jobs
python main.py --list-jobs

# AI planning mode (Phase 4)
python main.py --ai "Find co-working spaces in Hyderabad"
```

### Key files to update when Google changes their DOM

1. `config/scrapers/google_maps.yaml` → update selector values
2. Run `python main.py --check-selectors` to verify
3. No Python code changes required

### Key files to create when adding a new scraper

1. `config/scrapers/{name}.yaml` → selectors and config
2. `harvest/scrapers/{name}/__init__.py`
3. `harvest/scrapers/{name}/scraper.py` → implement `BaseScraper`
4. Registry auto-discovers it. No other files need modification.

---

*End of Harvest Architecture Spec v1.0*
*Last updated: 2025*
