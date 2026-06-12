#!/usr/bin/env python3
"""Sync Garmin Connect data and build dashboard.json for the Next.js app."""

from __future__ import annotations

import json
import os
import sys
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Any

from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = Path(os.getenv("WELLNESS_DATA_DIR") or (ROOT / "data"))
OUTPUT = DATA_DIR / "dashboard.json"
PUBLIC_OUTPUT = ROOT / "public" / "data" / "dashboard.json"


def publish_dashboard_json(payload: dict[str, Any] | str) -> None:
    """Write dashboard JSON for local dev and GitHub Pages static build."""
    text = payload if isinstance(payload, str) else json.dumps(payload, indent=2)
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(text, encoding="utf-8")
    PUBLIC_OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    PUBLIC_OUTPUT.write_text(text, encoding="utf-8")

load_dotenv(ROOT / ".env")


def clamp(n: float, lo: float = 0, hi: float = 100) -> float:
    return max(lo, min(hi, n))


def recovery_zone(score: float) -> str:
    if score >= 67:
        return "green"
    if score >= 34:
        return "yellow"
    return "red"


def target_strain(recovery_score: float) -> dict[str, float]:
    if recovery_score >= 67:
        return {"min": 14, "max": 18}
    if recovery_score >= 34:
        return {"min": 10, "max": 14}
    return {"min": 4, "max": 8}


def compute_recovery(
    hrv: float,
    hrv_base: float,
    rhr: float,
    rhr_base: float,
    sleep_score: float,
    prior_strain: float,
    bb_morning: float | None = None,
) -> dict[str, Any]:
    hrv_score = clamp((hrv / hrv_base) * 100) if hrv_base else 50
    rhr_score = clamp(100 - (rhr - rhr_base) * 8) if rhr_base else 50
    load_penalty = clamp(100 - max(0, prior_strain - 12) * 6)
    score = round(0.35 * hrv_score + 0.25 * rhr_score + 0.3 * sleep_score + 0.1 * load_penalty)
    if bb_morning is not None and bb_morning < 30:
        score = max(0, score - 8)
    score = int(clamp(score))

    hrv_delta = round(((hrv - hrv_base) / hrv_base) * 100) if hrv_base else 0
    rhr_delta = round(rhr - rhr_base)

    drivers = [
        {
            "factor": "hrv",
            "label": "HRV",
            "value": round(hrv),
            "baseline": round(hrv_base),
            "delta": f"{hrv_delta:+d}%",
            "impact": "high" if hrv_delta < -10 else "positive" if hrv_delta > 5 else "medium",
        },
        {
            "factor": "rhr",
            "label": "Resting HR",
            "value": round(rhr),
            "baseline": round(rhr_base),
            "delta": f"{rhr_delta:+d} bpm",
            "impact": "high" if rhr_delta > 3 else "positive" if rhr_delta < 0 else "low",
        },
        {
            "factor": "sleep",
            "label": "Sleep",
            "value": f"{int(sleep_score)}%",
            "impact": "high" if sleep_score < 70 else "positive" if sleep_score >= 85 else "medium",
        },
        {
            "factor": "load",
            "label": "Prior strain",
            "value": round(prior_strain, 1),
            "impact": "high" if prior_strain > 16 else "positive" if prior_strain < 10 else "medium",
        },
    ]
    order = {"high": 0, "medium": 1, "low": 2, "positive": 3}
    drivers.sort(key=lambda d: order[d["impact"]])

    return {"score": score, "zone": recovery_zone(score), "drivers": drivers}


def estimate_strain(load: float) -> float:
    return round(min(21.0, (load / 180) * 21), 1)


def _merge_daily_stats(*sources: dict[str, Any] | None) -> dict[str, Any]:
    merged: dict[str, Any] = {}
    for src in sources:
        if isinstance(src, dict):
            merged.update(src)
    return merged


def _steps_from_daily_payload(payload: Any) -> int:
    if isinstance(payload, dict):
        for key in ("totalSteps", "steps", "stepCount"):
            if payload.get(key) is not None:
                return int(payload[key])
        for key in ("calendarDay", "date"):
            day_block = payload.get(key)
            if isinstance(day_block, dict):
                steps = _steps_from_daily_payload(day_block)
                if steps:
                    return steps
    if isinstance(payload, list):
        for item in reversed(payload):
            steps = _steps_from_daily_payload(item)
            if steps:
                return steps
    return 0


def parse_daily_activity(api, day: str) -> dict[str, Any]:
    """Steps, calories, and all-day movement from Garmin daily summary."""
    empty = {
        "steps": 0,
        "stepGoal": 10000,
        "activeCalories": 0,
        "bmrCalories": 0,
        "totalCalories": 0,
        "distanceKm": 0.0,
        "moderateIntensityMin": 0,
        "vigorousIntensityMin": 0,
    }

    summary: dict[str, Any] | None = None
    stats_body: dict[str, Any] | None = None

    try:
        raw = api.get_user_summary(day)
        if isinstance(raw, dict):
            summary = raw
    except Exception:
        pass

    try:
        stats = api.get_stats_and_body(day)
        if isinstance(stats, dict):
            bb = stats.get("bodyBattery")
            stats_body = bb if isinstance(bb, dict) else stats
    except Exception:
        pass

    body = _merge_daily_stats(stats_body, summary)
    if not body:
        return empty

    steps = int(body.get("totalSteps") or body.get("steps") or 0)
    if steps == 0:
        try:
            steps = _steps_from_daily_payload(api.get_daily_steps(day, day))
        except Exception:
            pass
    if steps == 0:
        try:
            steps = _steps_from_daily_payload(api.get_steps_data(day))
        except Exception:
            pass

    distance_m = float(
        body.get("totalDistanceMeters")
        or body.get("wellnessDistanceMeters")
        or body.get("distanceInMeters")
        or 0
    )
    return {
        "steps": steps,
        "stepGoal": int(body.get("dailyStepGoal") or body.get("stepGoal") or 10000),
        "activeCalories": int(
            body.get("activeKilocalories") or body.get("wellnessActiveKilocalories") or 0
        ),
        "bmrCalories": int(body.get("bmrKilocalories") or 0),
        "totalCalories": int(body.get("totalKilocalories") or body.get("wellnessKilocalories") or 0),
        "distanceKm": round(distance_m / 1000, 2) if distance_m > 0 else 0.0,
        "moderateIntensityMin": int(body.get("moderateIntensityMinutes") or 0),
        "vigorousIntensityMin": int(body.get("vigorousIntensityMinutes") or 0),
    }


def estimate_lifestyle_load(daily: dict[str, Any], workout_calories: int) -> float:
    """Non-workout movement: walking, chores, commute — from steps & active calories."""
    active = int(daily.get("activeCalories") or 0)
    steps = int(daily.get("steps") or 0)
    lifestyle_kcal = max(0, active - workout_calories)

    load_from_kcal = lifestyle_kcal * 0.28
    load_from_steps = max(0, steps - 4000) * 0.005
    lifestyle = max(load_from_kcal, load_from_steps)

    mod = int(daily.get("moderateIntensityMin") or 0)
    vig = int(daily.get("vigorousIntensityMin") or 0)
    lifestyle += min(12.0, mod * 0.2 + vig * 0.1)
    return lifestyle


def compose_day_strain(workout_load: float, daily: dict[str, Any], workout_calories: int) -> dict[str, Any]:
    lifestyle_load = estimate_lifestyle_load(daily, workout_calories)
    workout_strain = estimate_strain(workout_load)
    lifestyle_strain = estimate_strain(lifestyle_load)
    current = round(min(21.0, workout_strain + lifestyle_strain), 1)
    return {
        "current": current,
        "workoutStrain": workout_strain,
        "lifestyleStrain": lifestyle_strain,
        "workoutLoad": round(workout_load, 1),
        "lifestyleLoad": round(lifestyle_load, 1),
    }


def weekly_stats(history: list[dict[str, Any]]) -> dict[str, Any]:
    last7 = history[:7]
    avg_recovery = round(sum(d["recovery"]["score"] for d in last7) / len(last7))
    avg_strain = round(sum(d["strain"]["current"] for d in last7) / len(last7), 1)
    avg_sleep = round(sum(d["sleep"]["score"] for d in last7) / len(last7))
    green_days = sum(1 for d in last7 if d["recovery"]["zone"] == "green")
    balanced = sum(
        1 for d in last7 if d["strain"]["targetMin"] <= d["strain"]["current"] <= d["strain"]["targetMax"]
    )
    balance_score = round((balanced / len(last7)) * 100)
    return {
        "avgRecovery": avg_recovery,
        "avgStrain": avg_strain,
        "avgSleep": avg_sleep,
        "greenDays": green_days,
        "balanceScore": balance_score,
        "narrative": (
            f"{green_days}/7 green recovery days. Strain matched recovery {balanced}/7 days "
            f"({balance_score}% balance). Avg recovery {avg_recovery}%, strain {avg_strain}, sleep {avg_sleep}%."
        ),
    }


def safe_list(val: Any) -> list:
    if isinstance(val, list):
        return val
    return []


def _extract_bb_points(values_array: Any) -> list[tuple[int, str, int]]:
    """Return sorted (epoch_ms, HH:MM, level) tuples from Garmin BB arrays."""
    out: list[tuple[int, str, int]] = []
    for item in safe_list(values_array):
        if len(item) < 2 or item[1] is None:
            continue
        try:
            ts, val = int(item[0]), int(item[1])
        except (TypeError, ValueError):
            continue
        if val < 0:
            continue
        out.append((ts, datetime.fromtimestamp(ts / 1000).strftime("%H:%M"), val))
    out.sort(key=lambda row: row[0])
    return out


def _bb_summary_scalars(summary: dict[str, Any]) -> tuple[int, int, int]:
    recent = int(summary.get("bodyBatteryMostRecentValue") or 0)
    low = int(summary.get("bodyBatteryLowestValue") or 0)
    high = int(summary.get("bodyBatteryHighestValue") or 0)
    if recent <= 0 and low <= 0 and high <= 0:
        return 0, 0, 0
    now = recent or high or low
    bb_min = low or now
    bb_max = high or now
    return now, bb_min, bb_max


def parse_body_battery(api, day: str) -> tuple[list[dict], int, int, int]:
    merged: dict[int, tuple[str, int]] = {}

    try:
        rows = api.get_body_battery(day, day)
        for row in safe_list(rows):
            if not isinstance(row, dict):
                continue
            for ts, label, val in _extract_bb_points(row.get("bodyBatteryValuesArray")):
                merged[ts] = (label, val)
    except Exception:
        pass

    if not merged:
        try:
            stress = api.get_all_day_stress(day)
            if isinstance(stress, dict):
                for ts, label, val in _extract_bb_points(stress.get("bodyBatteryValuesArray")):
                    merged[ts] = (label, val)
        except Exception:
            pass

    summary_now = summary_min = summary_max = 0
    try:
        summary = api.get_user_summary(day)
        if isinstance(summary, dict):
            summary_now, summary_min, summary_max = _bb_summary_scalars(summary)
    except Exception:
        pass

    if merged:
        ordered = sorted(merged.items(), key=lambda item: item[0])
        points = [{"time": label, "value": val} for _, (label, val) in ordered]
        values = [val for _, val in ordered]
        return points, values[-1], min(values), max(values)

    if summary_now > 0:
        ref = date.fromisoformat(day)
        is_today = ref == date.today()
        now_label = datetime.now().strftime("%H:%M") if is_today else "20:00"
        curve: list[dict[str, Any]] = []
        if summary_min > 0 and summary_min != summary_now:
            curve.append({"time": "06:30", "value": summary_min})
        if summary_max > 0 and summary_max not in {summary_min, summary_now}:
            curve.append({"time": "14:00", "value": summary_max})
        curve.append({"time": now_label, "value": summary_now})
        return curve, summary_now, summary_min or summary_now, summary_max or summary_now

    return [], 0, 0, 0


SLEEP_LEVEL_MAP = {0: "awake", 1: "light", 2: "deep", 3: "rem"}


def parse_stress(api, day: str) -> tuple[list[dict], float, float]:
    try:
        data = api.get_all_day_stress(day)
        if not isinstance(data, dict):
            return [], 0, 0
        points = []
        values = []
        for item in safe_list(data.get("stressValuesArray")):
            if len(item) >= 2 and item[1] is not None and item[1] >= 0:
                ts, val = item[0], item[1]
                t = datetime.fromtimestamp(ts / 1000).strftime("%H:%M")
                points.append({"time": t, "value": int(val)})
                values.append(int(val))
        if not values:
            return [], 0, 0
        avg = float(data.get("avgStressLevel") or round(sum(values) / len(values)))
        peak = float(data.get("maxStressLevel") or max(values))
        return points, round(avg), int(peak)
    except Exception:
        return [], 0, 0


def parse_respiration(api, day: str) -> float | None:
    try:
        data = api.get_respiration_data(day) or {}
        val = data.get("avgSleepRespirationValue") or data.get("avgWakingRespirationValue")
        return round(float(val), 1) if val is not None else None
    except Exception:
        return None


def parse_sleep_levels(levels: list[dict]) -> list[dict]:
    segments: list[dict] = []
    for block in safe_list(levels):
        start = block.get("startGMT") or block.get("startTimestampGMT")
        end = block.get("endGMT") or block.get("endTimestampGMT")
        level = int(block.get("activityLevel", 1))
        if not start or not end:
            continue
        try:
            start_dt = datetime.fromisoformat(str(start).replace(".0", "").replace("Z", "+00:00"))
            end_dt = datetime.fromisoformat(str(end).replace(".0", "").replace("Z", "+00:00"))
            minutes = max(1, int((end_dt - start_dt).total_seconds() / 60))
        except Exception:
            minutes = 5
        segments.append(
            {
                "level": SLEEP_LEVEL_MAP.get(level, "light"),
                "minutes": minutes,
                "start": str(start)[:16],
            }
        )
    return segments


def parse_sleep(api, day: str) -> dict[str, Any]:
    empty = {
        "score": 70,
        "hours": 7.0,
        "need": 7.5,
        "deepMin": 0,
        "remMin": 0,
        "lightMin": 0,
        "awakeMin": 0,
        "hypnogram": [],
    }
    try:
        data = api.get_sleep_data(day)
        dto = data.get("dailySleepDTO") or data
        score = dto.get("sleepScores", {}).get("overall", {}).get("value") or dto.get("sleepScore") or 70
        deep = (dto.get("deepSleepSeconds") or 0) // 60
        rem = (dto.get("remSleepSeconds") or dto.get("dreamSleepSeconds") or 0) // 60
        light = (dto.get("lightSleepSeconds") or 0) // 60
        awake = (dto.get("awakeSleepSeconds") or 0) // 60
        hours = (dto.get("sleepTimeSeconds") or dto.get("sleepingTimeSeconds") or 0) / 3600
        levels = parse_sleep_levels(data.get("sleepLevels") or dto.get("sleepLevels") or [])
        return {
            "score": int(score),
            "hours": round(hours, 1),
            "need": 7.5,
            "deepMin": deep,
            "remMin": rem,
            "lightMin": light,
            "awakeMin": awake,
            "hypnogram": levels,
        }
    except Exception:
        return empty


def readiness_zone(score: int) -> str:
    if score >= 95:
        return "prime"
    if score >= 75:
        return "high"
    if score >= 50:
        return "moderate"
    if score >= 25:
        return "low"
    return "poor"


def readiness_label(zone: str) -> str:
    return {
        "prime": "Prime",
        "high": "High",
        "moderate": "Moderate",
        "low": "Low",
        "poor": "Poor",
    }.get(zone, "Moderate")


def compute_readiness(
    recovery_score: int,
    sleep_score: int,
    hrv: float,
    hrv_base: float,
    rhr: float,
    rhr_base: float,
    bb_now: int,
    stress_avg: float,
) -> dict[str, Any]:
    hrv_pct = min(100.0, (hrv / hrv_base) * 100) if hrv_base else 50.0
    rhr_pct = max(0.0, 100.0 - max(0.0, rhr - rhr_base) * 8)
    stress_pct = max(0.0, 100.0 - stress_avg * 0.85)
    score = int(
        round(
            0.32 * recovery_score
            + 0.22 * sleep_score
            + 0.18 * hrv_pct
            + 0.12 * bb_now
            + 0.10 * rhr_pct
            + 0.06 * stress_pct
        )
    )
    score = int(clamp(score))
    zone = readiness_zone(score)
    return {"score": score, "zone": zone, "label": readiness_label(zone)}


def parse_hrv_rhr(api, day: str) -> tuple[float, float]:
    hrv, rhr = 45.0, 52.0
    try:
        stats = api.get_stats_and_body(day)
        body = stats.get("bodyBattery") or stats
        if isinstance(body, dict):
            rhr = float(body.get("restingHeartRate") or body.get("currentDayRestingHeartRate") or rhr)
        hrv_data = api.get_hrv_data(day)
        if isinstance(hrv_data, dict):
            summary = hrv_data.get("hrvSummary") or hrv_data
            last = summary.get("lastNightAvg") or summary.get("weeklyAvg")
            if last:
                hrv = float(last)
    except Exception:
        pass
    return hrv, rhr


def parse_hr_zones(act: dict) -> dict[str, float] | None:
    zones = {}
    has_data = False
    for i in range(1, 6):
        seconds = float(act.get(f"hrTimeInZone_{i}") or 0)
        if seconds > 0:
            has_data = True
        zones[f"z{i}"] = round(seconds / 60, 1)
    return zones if has_data else None


def parse_pace_min_per_km(act: dict) -> float | None:
    speed = act.get("averageSpeed")
    if not speed or float(speed) <= 0:
        return None
    sec_per_km = 1000 / float(speed)
    return round(sec_per_km / 60, 2)


def parse_activity_entry(act: dict, fallback_date: str | None = None) -> dict[str, Any]:
    duration = int((act.get("duration") or 0) / 60)
    load = float(act.get("activityTrainingLoad") or act.get("trainingLoad") or duration * 2)
    distance_m = float(act.get("distance") or 0)
    entry: dict[str, Any] = {
        "name": act.get("activityName") or "Workout",
        "type": act.get("activityType", {}).get("typeKey") or "activity",
        "durationMin": duration,
        "strain": estimate_strain(load),
        "avgHr": int(act.get("averageHR") or 0),
    }
    if act.get("activityId"):
        entry["activityId"] = int(act["activityId"])
    if act.get("maxHR"):
        entry["maxHr"] = int(act["maxHR"])
    if act.get("calories"):
        entry["calories"] = int(act["calories"])
    if distance_m > 0:
        entry["distanceKm"] = round(distance_m / 1000, 2)
    pace = parse_pace_min_per_km(act)
    if pace:
        entry["paceMinPerKm"] = pace
    if act.get("startTimeLocal"):
        stl = str(act["startTimeLocal"])
        entry["startTime"] = stl[11:16]
        entry["date"] = stl[:10]
    elif fallback_date:
        entry["date"] = fallback_date
    zones = parse_hr_zones(act)
    if zones:
        entry["hrZones"] = zones
    if act.get("moderateIntensityMinutes") is not None:
        entry["moderateIntensityMin"] = int(act["moderateIntensityMinutes"])
    if act.get("vigorousIntensityMinutes") is not None:
        entry["vigorousIntensityMin"] = int(act["vigorousIntensityMinutes"])
    return entry


def parse_activities(api, day: str) -> tuple[list[dict], float]:
    workouts = []
    total_load = 0.0
    try:
        activities = api.get_activities_by_date(day, day)
        for act in safe_list(activities):
            entry = parse_activity_entry(act, fallback_date=day)
            load = float(act.get("activityTrainingLoad") or act.get("trainingLoad") or entry["durationMin"] * 2)
            total_load += load
            workouts.append(entry)
    except Exception:
        pass
    return workouts, total_load


def fetch_month_workouts(api, ref: date | None = None) -> dict[str, Any]:
    ref = ref or date.today()
    month_key = ref.strftime("%Y-%m")
    start = ref.replace(day=1).isoformat()
    end = ref.isoformat()
    workouts: list[dict[str, Any]] = []
    try:
        activities = api.get_activities_by_date(start, end)
        for act in safe_list(activities):
            workouts.append(parse_activity_entry(act))
    except Exception:
        pass
    workouts.sort(key=lambda w: (w.get("date", ""), w.get("startTime", "00:00")), reverse=True)
    return {"month": month_key, "workouts": workouts}


def load_user_profile(api) -> dict[str, Any]:
    """Age, VO2 max, and gender from Garmin profile + user-settings."""
    profile: dict[str, Any] = {}
    try:
        profile = api.get_user_profile() or {}
    except Exception:
        profile = {}

    try:
        settings = api.connectapi("/userprofile-service/userprofile/user-settings") or {}
        ud = settings.get("userData") or {}
        if ud.get("birthDate"):
            profile["birthDate"] = ud["birthDate"]
        if ud.get("vo2MaxRunning") is not None:
            profile["vo2maxRunning"] = ud["vo2MaxRunning"]
        if ud.get("vo2MaxCycling") is not None:
            profile["vo2maxCycling"] = ud["vo2MaxCycling"]
        if ud.get("gender"):
            profile["gender"] = ud["gender"]
    except Exception:
        pass

    env_age = os.getenv("GARMIN_CHRONOLOGICAL_AGE")
    if env_age:
        profile["age"] = int(env_age)

    return profile


def chronological_age(profile: dict[str, Any], ref: date | None = None) -> int:
    ref = ref or date.today()
    if profile.get("age"):
        return int(profile["age"])
    birth = profile.get("birthDate") or profile.get("birthdate")
    if birth:
        bd = date.fromisoformat(str(birth)[:10])
        age = ref.year - bd.year
        if (ref.month, ref.day) < (bd.month, bd.day):
            age -= 1
        return age
    return 40


def estimate_fitness_age(chrono: int, vo2: float, gender: str | None = None) -> int:
    """Fallback when Garmin fitnessage API is unavailable."""
    baseline = 44.0 if (gender or "").upper() == "MALE" else 38.0
    years_younger = (vo2 - baseline) / 0.9
    return max(18, int(round(chrono - years_younger)))


def fetch_garmin_fitness_age(api, day: str) -> dict[str, Any] | None:
    """Official Fitness Age from Garmin Connect (/fitnessage-service/fitnessage)."""
    try:
        data = api.connectapi(f"/fitnessage-service/fitnessage/{day}") or {}
        if data.get("fitnessAge") is None:
            return None
        return data
    except Exception:
        return None


def fitness_age_tips(components: dict[str, Any] | None) -> list[str]:
    if not components:
        return []
    tips: list[str] = []
    ordered = sorted(
        [(k, v) for k, v in components.items() if isinstance(v, dict)],
        key=lambda item: item[1].get("priority", 99),
    )
    for key, comp in ordered[:2]:
        if key == "bmi" and comp.get("improvementValue"):
            tips.append(
                f"BMI is the top lever — about {comp['improvementValue']:.1f} points from Garmin's target."
            )
        elif key == "vigorousMinutesAvg" and comp.get("targetValue") is not None:
            gap = max(0, float(comp["targetValue"]) - float(comp.get("value", 0)))
            if gap > 0:
                tips.append(f"Add ~{gap:.0f} vigorous minutes per week to lower fitness age.")
        elif key == "vigorousDaysAvg" and comp.get("targetValue") is not None:
            tips.append(
                f"Target {int(comp['targetValue'])} vigorous days/week — you're averaging {float(comp.get('value', 0)):.1f}."
            )
    return tips


def fetch_vo2_for_day(api, day: str, profile: dict[str, Any]) -> float:
    try:
        metrics = api.get_max_metrics(day)
        if metrics and isinstance(metrics, list):
            for block in ("generic", "cycling"):
                section = metrics[0].get(block) or {}
                if section.get("vo2MaxValue") is not None:
                    return float(section["vo2MaxValue"])
    except Exception:
        pass
    return float(profile.get("vo2maxRunning") or profile.get("vo2maxCycling") or 42)


def downsample(points: list[dict], max_points: int = 12) -> list[dict]:
    if len(points) <= max_points:
        return points
    step = max(1, len(points) // max_points)
    return points[::step][:max_points]


def build_day(api, day: str, baselines: dict[str, float], prior_strain: float, profile: dict) -> dict[str, Any]:
    sleep = parse_sleep(api, day)
    bb_curve, bb_now, bb_min, bb_max = parse_body_battery(api, day)
    stress_curve, stress_avg, stress_max = parse_stress(api, day)
    hrv, rhr = parse_hrv_rhr(api, day)
    daily_activity = parse_daily_activity(api, day)
    workouts, workout_load = parse_activities(api, day)
    workout_calories = sum(int(w.get("calories") or 0) for w in workouts)
    strain_parts = compose_day_strain(workout_load, daily_activity, workout_calories)

    recovery = compute_recovery(
        hrv=hrv,
        hrv_base=baselines["hrv"],
        rhr=rhr,
        rhr_base=baselines["rhr"],
        sleep_score=sleep["score"],
        prior_strain=prior_strain,
        bb_morning=bb_curve[0]["value"] if bb_curve else None,
    )
    targets = target_strain(recovery["score"])

    vo2 = fetch_vo2_for_day(api, day, profile)
    ref = date.fromisoformat(day)
    fitness_data = fetch_garmin_fitness_age(api, day)
    if fitness_data:
        chrono = int(round(float(fitness_data["chronologicalAge"])))
        fitness_age = int(round(float(fitness_data["fitnessAge"])))
        achievable = (
            int(round(float(fitness_data["achievableFitnessAge"])))
            if fitness_data.get("achievableFitnessAge") is not None
            else None
        )
        fitness_source = "garmin"
        fitness_tips = fitness_age_tips(fitness_data.get("components"))
    else:
        chrono = chronological_age(profile, ref)
        fitness_age = estimate_fitness_age(chrono, vo2, profile.get("gender"))
        achievable = None
        fitness_source = "estimate"
        fitness_tips = []

    respiration = parse_respiration(api, day)
    readiness = compute_readiness(
        recovery_score=recovery["score"],
        sleep_score=sleep["score"],
        hrv=hrv,
        hrv_base=baselines["hrv"],
        rhr=rhr,
        rhr_base=baselines["rhr"],
        bb_now=bb_now,
        stress_avg=stress_avg,
    )

    day_obj = {
        "date": day,
        "recovery": recovery,
        "strain": {
            **strain_parts,
            "targetMin": targets["min"],
            "targetMax": targets["max"],
            "workouts": workouts,
            "dailyActivity": daily_activity,
        },
        "sleep": {**sleep, "debt7d": 0.0},
        "vitals": {
            "hrv": round(hrv),
            "hrvBaseline": round(baselines["hrv"]),
            "rhr": round(rhr),
            "rhrBaseline": round(baselines["rhr"]),
            "stressAvg": int(stress_avg),
            "stressMax": int(stress_max),
            "bodyBatteryNow": bb_now,
            "bodyBatteryMin": bb_min,
            "bodyBatteryMax": bb_max,
            "vo2max": round(vo2),
            "fitnessAge": fitness_age,
            "chronologicalAge": chrono,
            "achievableFitnessAge": achievable,
            "fitnessAgeSource": fitness_source,
            "fitnessAgeTips": fitness_tips,
            "respirationRate": respiration,
            "readinessScore": readiness["score"],
            "readinessZone": readiness["zone"],
            "readinessLabel": readiness["label"],
        },
        "curves": {
            "bodyBattery": downsample(bb_curve),
            "stress": downsample(stress_curve, max_points=32),
        },
        "coach": {"morning": "", "evening": ""},
    }
    return day_obj


def main() -> int:
    email = os.getenv("GARMIN_EMAIL")
    password = os.getenv("GARMIN_PASSWORD")
    tokenstore = os.getenv("GARMINTOKENS") or str(DATA_DIR / ".garmin-tokens")

    if not email or not password:
        print("Set GARMIN_EMAIL and GARMIN_PASSWORD in .env", file=sys.stderr)
        return 1

    try:
        from garminconnect import Garmin
    except ImportError:
        print("Run: pip install -r scripts/requirements.txt", file=sys.stderr)
        return 1

    DATA_DIR.mkdir(parents=True, exist_ok=True)
    api = Garmin(email, password)

    try:
        if Path(tokenstore).exists():
            print(f"Using saved tokens: {tokenstore}")
            api.login(tokenstore=tokenstore)
        else:
            print("Logging in to Garmin Connect (MFA may be required in terminal)...")
            api.login()
            api.garth.dump(tokenstore)
            print(f"Tokens saved to {tokenstore}")
    except Exception as exc:
        print(f"Garmin login failed: {exc}", file=sys.stderr)
        print(
            "If MFA is enabled, run in terminal: cd wellness-dashboard && npm run sync",
            file=sys.stderr,
        )
        return 1

    profile = load_user_profile(api)

    days = max(3, min(14, int(os.getenv("SYNC_DAYS", "7"))))
    history: list[dict[str, Any]] = []
    hrv_vals: list[float] = []
    rhr_vals: list[float] = []
    prior_strain = 10.0

    for offset in range(days - 1, -1, -1):
        d = (date.today() - timedelta(days=offset)).isoformat()
        hrv, rhr = parse_hrv_rhr(api, d)
        if hrv:
            hrv_vals.append(hrv)
        if rhr:
            rhr_vals.append(rhr)

    baselines = {
        "hrv": sum(hrv_vals) / len(hrv_vals) if hrv_vals else 45.0,
        "rhr": sum(rhr_vals) / len(rhr_vals) if rhr_vals else 52.0,
    }

    for offset in range(days - 1, -1, -1):
        d = (date.today() - timedelta(days=offset)).isoformat()
        day_obj = build_day(api, d, baselines, prior_strain, profile)
        history.append(day_obj)
        prior_strain = day_obj["strain"]["current"]

    # sleep debt rolling 7d
    for i, day_obj in enumerate(history):
        window = history[max(0, i - 6) : i + 1]
        debt = sum(max(0, d["sleep"]["need"] - d["sleep"]["hours"]) for d in window)
        day_obj["sleep"]["debt7d"] = round(debt, 1)

    history.reverse()
    payload = {
        "device": "Garmin Venu 2",
        "syncedAt": datetime.utcnow().isoformat() + "Z",
        "source": "garmin",
        "today": history[0],
        "history": history,
        "weekly": weekly_stats(history),
        "monthWorkouts": fetch_month_workouts(api),
    }

    publish_dashboard_json(payload)
    print(f"Wrote {OUTPUT} and {PUBLIC_OUTPUT}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
