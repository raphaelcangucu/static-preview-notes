from pathlib import Path

from PIL import Image, ImageDraw


AUDIT_DIRECTORY = Path("docs/visual-audit/2026-08-20")
BEFORE_DIRECTORY = AUDIT_DIRECTORY / "before"
AFTER_DIRECTORY = AUDIT_DIRECTORY / "after"
COMPARISON_DIRECTORY = AUDIT_DIRECTORY / "comparison"
HEADER_HEIGHT = 40
DIVIDER_WIDTH = 4
BACKGROUND_COLOR = "#111318"
DIVIDER_COLOR = "#3f434c"
LABEL_COLOR = "#f2f4f8"


def create_comparison(before_path: Path, after_path: Path) -> None:
    with Image.open(before_path) as before_image, Image.open(after_path) as after_image:
        before = before_image.convert("RGB")
        after = after_image.convert("RGB")
        content_height = max(before.height, after.height)
        output = Image.new(
            "RGB",
            (
                before.width + DIVIDER_WIDTH + after.width,
                HEADER_HEIGHT + content_height,
            ),
            BACKGROUND_COLOR,
        )
        output.paste(before, (0, HEADER_HEIGHT))
        output.paste(after, (before.width + DIVIDER_WIDTH, HEADER_HEIGHT))

        draw = ImageDraw.Draw(output)
        draw.rectangle(
            (
                before.width,
                0,
                before.width + DIVIDER_WIDTH - 1,
                output.height,
            ),
            fill=DIVIDER_COLOR,
        )
        draw.text((12, 12), "BEFORE", fill=LABEL_COLOR)
        draw.text(
            (before.width + DIVIDER_WIDTH + 12, 12),
            "AFTER",
            fill=LABEL_COLOR,
        )

        comparison_name = before_path.name.replace(
            "-top.png",
            "-top-comparison.png",
        )
        output.save(COMPARISON_DIRECTORY / comparison_name, optimize=True)


def main() -> None:
    COMPARISON_DIRECTORY.mkdir(parents=True, exist_ok=True)

    before_images = sorted(BEFORE_DIRECTORY.glob("*-top.png"))
    if not before_images:
        raise RuntimeError(f"No top screenshots found in {BEFORE_DIRECTORY}")

    for before_path in before_images:
        after_path = AFTER_DIRECTORY / before_path.name
        if not after_path.exists():
            raise RuntimeError(f"Missing matching after screenshot: {after_path}")

        create_comparison(before_path, after_path)


if __name__ == "__main__":
    main()
