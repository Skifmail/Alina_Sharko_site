#!/usr/bin/env python3
"""Batch image optimizer for static site assets.

Optimizes JPG/JPEG/PNG/WEBP files in a directory tree in-place.
It can resize very large images (by max edge) and recompress files.
"""

from __future__ import annotations

import argparse
import logging
import os
from pathlib import Path
import tempfile
from typing import Iterable

from PIL import Image, ImageOps


LOGGER = logging.getLogger("optimize_images")
SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}


def iter_image_paths(root: Path) -> Iterable[Path]:
    """Yield image file paths recursively from root directory."""
    for path in root.rglob("*"):
        if path.is_file() and path.suffix.lower() in SUPPORTED_EXTENSIONS:
            yield path


def optimize_one(path: Path, max_edge: int, jpeg_quality: int, webp_quality: int) -> tuple[int, int, bool]:
    """Optimize a single image in-place.

    Returns:
        (old_size_bytes, new_size_bytes, changed)
    """
    old_size = path.stat().st_size
    suffix = path.suffix.lower()

    with Image.open(path) as img:
        img = ImageOps.exif_transpose(img)
        width, height = img.size
        longest_edge = max(width, height)

        if longest_edge > max_edge:
            ratio = max_edge / float(longest_edge)
            new_size = (max(1, int(round(width * ratio))), max(1, int(round(height * ratio))))
            img = img.resize(new_size, Image.Resampling.LANCZOS)

        save_kwargs: dict[str, int | bool | str] = {"optimize": True}

        fd, temp_path = tempfile.mkstemp(prefix="imgopt_", suffix=suffix, dir=str(path.parent))
        os.close(fd)
        temp_file = Path(temp_path)

        if suffix in {".jpg", ".jpeg"}:
            if img.mode not in ("RGB", "L"):
                img = img.convert("RGB")
            save_kwargs.update({"quality": jpeg_quality, "progressive": True})
            img.save(temp_file, format="JPEG", **save_kwargs)
        elif suffix == ".png":
            if img.mode not in ("RGBA", "RGB", "L", "P"):
                img = img.convert("RGBA")
            save_kwargs.update({"compress_level": 9})
            img.save(temp_file, format="PNG", **save_kwargs)
        elif suffix == ".webp":
            save_kwargs.update({"quality": webp_quality, "method": 6})
            img.save(temp_file, format="WEBP", **save_kwargs)
        else:
            return old_size, old_size, False

    new_size = temp_file.stat().st_size
    if new_size <= old_size:
        os.replace(temp_file, path)
        return old_size, new_size, new_size != old_size

    temp_file.unlink(missing_ok=True)
    return old_size, old_size, False


def parse_args() -> argparse.Namespace:
    """Parse CLI args."""
    parser = argparse.ArgumentParser(description="Optimize images in-place.")
    parser.add_argument("root", type=Path, help="Root directory with images.")
    parser.add_argument("--max-edge", type=int, default=2400, help="Resize images whose max side exceeds this value.")
    parser.add_argument("--jpeg-quality", type=int, default=82, help="JPEG quality (1-95).")
    parser.add_argument("--webp-quality", type=int, default=82, help="WEBP quality (1-100).")
    return parser.parse_args()


def configure_logging() -> None:
    """Configure application logging."""
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")


def main() -> int:
    """CLI entry point."""
    configure_logging()
    args = parse_args()

    root = args.root.resolve()
    if not root.exists() or not root.is_dir():
        LOGGER.error("Directory does not exist: %s", root)
        return 1

    paths = list(iter_image_paths(root))
    if not paths:
        LOGGER.warning("No supported images found in %s", root)
        return 0

    total_old = 0
    total_new = 0
    changed_count = 0

    for image_path in paths:
        try:
            old_size, new_size, changed = optimize_one(
                image_path,
                max_edge=args.max_edge,
                jpeg_quality=args.jpeg_quality,
                webp_quality=args.webp_quality,
            )
            total_old += old_size
            total_new += new_size
            if changed:
                changed_count += 1
                delta = old_size - new_size
                LOGGER.info("Optimized: %s (saved %.1f KB)", image_path, delta / 1024.0)
            else:
                LOGGER.info("No change: %s", image_path)
        except Exception as exc:  # noqa: BLE001
            LOGGER.exception("Failed: %s (%s)", image_path, exc)

    saved = total_old - total_new
    saved_pct = (saved / total_old * 100.0) if total_old else 0.0
    LOGGER.info(
        "Done. Files: %d, changed: %d, total saved: %.2f MB (%.1f%%)",
        len(paths),
        changed_count,
        saved / (1024.0 * 1024.0),
        saved_pct,
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
